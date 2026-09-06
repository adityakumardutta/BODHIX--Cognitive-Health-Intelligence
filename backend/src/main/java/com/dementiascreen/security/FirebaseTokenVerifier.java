package com.dementiascreen.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwsHeader;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.JwtParser;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SigningKeyResolverAdapter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.security.PublicKey;
import java.security.cert.CertificateFactory;
import java.security.cert.X509Certificate;
import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Server-side verification of Firebase ID tokens (Google sign-in).
 * Verifies the RS256 signature against Google's published public X.509 keys,
 * the issuer, audience (project id) and expiry — no service-account private
 * key is ever needed or exposed (public keys are public).
 */
@Service
public class FirebaseTokenVerifier {

    private static final Logger log = LoggerFactory.getLogger(FirebaseTokenVerifier.class);
    private static final String GOOGLE_PUBLIC_KEYS_URL =
            "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com";
    private static final Duration KEY_CACHE_TTL = Duration.ofHours(1);

    private final String projectId;
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    private volatile Map<String, PublicKey> cachedKeys = new ConcurrentHashMap<>();
    private volatile Instant keysFetchedAt = Instant.EPOCH;

    public FirebaseTokenVerifier(@Value("${app.firebase.project-id:}") String projectId) {
        this.projectId = projectId;
        if (projectId == null || projectId.isBlank()) {
            log.warn("Firebase project id NOT configured - Google sign-in verification will reject all tokens");
        } else {
            log.info("Firebase ID-token verification configured for project {}", projectId);
        }
    }

    /** Result of a verified Firebase ID token. */
    public record VerifiedIdentity(String uid, String email, boolean emailVerified) {}

    public VerifiedIdentity verify(String idToken) {
        if (projectId == null || projectId.isBlank()) {
            log.error("Firebase project id is not configured (app.firebase.project-id)");
            throw new JwtException("Firebase is not configured");
        }
        try {
            JwtParser parser = Jwts.parserBuilder()
                    .setAllowedClockSkewSeconds(60)
                    .setSigningKeyResolver(new SigningKeyResolverAdapter() {
                        @Override
                        public PublicKey resolveSigningKey(JwsHeader header, Claims claims) {
                            PublicKey key = publicKeys().get(header.getKeyId());
                            if (key == null) {
                                refreshKeys();
                                key = cachedKeys.get(header.getKeyId());
                            }
                            if (key == null) {
                                throw new JwtException("Unknown signing key");
                            }
                            return key;
                        }
                    })
                    .build();

            Claims claims = parser.parseClaimsJws(idToken).getBody();

            String issuer = "https://securetoken.google.com/" + projectId;
            if (!issuer.equals(claims.getIssuer())) {
                throw new JwtException("Invalid token issuer");
            }
            if (claims.getAudience() == null || !claims.getAudience().contains(projectId)) {
                throw new JwtException("Invalid token audience");
            }

            String email = claims.get("email", String.class);
            Boolean emailVerified = claims.get("email_verified", Boolean.class);
            if (email == null || email.isBlank() || !Boolean.TRUE.equals(emailVerified)) {
                throw new JwtException("Google account email is not verified");
            }
            return new VerifiedIdentity(claims.getSubject(), email.trim(), true);
        } catch (JwtException e) {
            throw e;
        } catch (Exception e) {
            // Log the exception class + message only (never the token or secrets).
            log.warn("Token verification failed unexpectedly: {} {}",
                    e.getClass().getSimpleName(), e.getMessage());
            throw new JwtException("Token verification failed");
        }
    }

    private synchronized Map<String, PublicKey> publicKeys() {
        if (cachedKeys.isEmpty() || keysFetchedAt.isBefore(Instant.now().minus(KEY_CACHE_TTL))) {
            refreshKeys();
        }
        return cachedKeys;
    }

    private synchronized void refreshKeys() {
        try {
            HttpRequest request = HttpRequest.newBuilder(URI.create(GOOGLE_PUBLIC_KEYS_URL))
                    .timeout(Duration.ofSeconds(10))
                    .GET()
                    .build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() != 200) {
                throw new IllegalStateException("Could not fetch Google public keys");
            }
            Map<String, PublicKey> keys = new ConcurrentHashMap<>();
            com.fasterxml.jackson.databind.JsonNode json =
                    new com.fasterxml.jackson.databind.ObjectMapper().readTree(response.body());
            CertificateFactory cf = CertificateFactory.getInstance("X.509");
            // Google's X.509 endpoint returns full PEM certificates
            // ("-----BEGIN CERTIFICATE-----\n..."). CertificateFactory parses PEM
            // directly. (Previously the code base64-decoded the PEM envelope,
            // which threw for every key, left the cache empty and rejected all
            // tokens as "Unknown signing key".)
            json.fieldNames().forEachRemaining(kid -> {
                try {
                    String pem = json.get(kid).asText();
                    X509Certificate cert = (X509Certificate) cf.generateCertificate(
                            new ByteArrayInputStream(pem.getBytes(StandardCharsets.UTF_8)));
                    keys.put(kid, cert.getPublicKey());
                } catch (Exception e) {
                    log.warn("Skipping Google public key {}: {}", kid, e.getMessage());
                }
            });
            log.info("Loaded {} Google public key(s) for Firebase ID-token verification", keys.size());
            if (!keys.isEmpty()) {
                cachedKeys = keys;
                keysFetchedAt = Instant.now();
            }
        } catch (Exception e) {
            log.warn("Failed to refresh Google public keys: {}", e.getMessage());
        }
    }
}