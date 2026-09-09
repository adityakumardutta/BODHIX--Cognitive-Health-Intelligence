package com.dementiascreen.config;

import com.dementiascreen.security.JwtAuthFilter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Value("${app.cors.allowed-origins}")
    private String allowedOrigins;

    private final JwtAuthFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .headers(headers -> headers
                 // Single-deployment: Spring Security headers now apply to BOTH
                 // the API responses AND the React SPA served from /static.
                 // The previous default-src 'none' policy (tuned for pure JSON
                 // responses) would block the SPA's own script/CSS and the
                 // inline theme bootstrap in index.html. The policy below stays
                 // strict: same-origin assets only, NO third-party scripts, no
                 // framing. Google Fonts remain allowed (UI typography);
                 // Google/Firebase AUTH endpoints were removed with Google login.
                 .contentSecurityPolicy(csp -> csp.policyDirectives(
                     "default-src 'self'; " +
                     "script-src 'self' 'unsafe-inline'; " +              // 'unsafe-inline': existing inline theme <script> in index.html (unchanged UI)
                     "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " + // existing Google Fonts stylesheet
                     "font-src 'self' data: https://fonts.gstatic.com; " + // existing Google Fonts files
                     "img-src 'self' data: blob:; " +
                     "connect-src 'self'; " +                             // same-origin API only (no third-party auth endpoints)
                     "frame-ancestors 'none'"))
                 .frameOptions(frame -> frame.deny())
                 .referrerPolicy(referrer -> referrer.policy(
                     org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter.ReferrerPolicy.NO_REFERRER))
                 .httpStrictTransportSecurity(hsts -> hsts
                     .includeSubDomains(true)
                     .preload(true)) // only emitted over HTTPS by Spring Security
                 .crossOriginOpenerPolicy(cop -> cop.policy(
                     org.springframework.security.web.header.writers.CrossOriginOpenerPolicyHeaderWriter.CrossOriginOpenerPolicy.SAME_ORIGIN_ALLOW_POPUPS))
             )
            .authorizeHttpRequests(auth -> auth
                 .requestMatchers("/api/auth/**").permitAll()
                 // Single-deployment: ALL other /api/** endpoints still require
                 // JWT authentication — API security is completely unchanged.
                 .requestMatchers("/api/**").authenticated()
                 // Everything else is the React SPA / static assets served by
                 // Spring Boot from classpath:/static (index.html, /assets/**,
                 // /favicon.png, SPA deep links via SpaWebConfig). These carry
                 // no privileged data (the SPA fetches /api/** with the JWT),
                 // so they are publicly reachable like any static site.
                 .anyRequest().permitAll()
             )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Allowed origins come ENTIRELY from the CORS_ALLOWED_ORIGINS environment
        // variable (surfaced here via app.cors.allowed-origins). Exact origins
        // only - no wildcard "*", no hardcoded localhost origins in code.
        // Local development uses the default placeholders in application.properties;
        // production sets CORS_ALLOWED_ORIGINS to the exact frontend origin,
        // e.g. https://bodhix-cognitive-health-intelligence-faca-ljqqykkav.vercel.app
        List<String> origins = Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
        configuration.setAllowedOrigins(origins);
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        // Explicit allow-list (no wildcard). Must cover the preflight-requested
        // headers the browser sends for authenticated calls.
        configuration.setAllowedHeaders(List.of(
                "Content-Type",
                "Authorization",
                "Accept",
                "Origin",
                "X-Requested-With"
        ));
        configuration.setExposedHeaders(List.of("Authorization", "Content-Type"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}