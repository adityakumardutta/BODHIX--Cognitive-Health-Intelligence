package com.dementiascreen.controller;

import com.dementiascreen.dto.LoginRequest;
import com.dementiascreen.dto.LoginResponse;
import com.dementiascreen.entity.User;
import com.dementiascreen.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    /**
     * Guest Login: creates a fresh temporary guest account server-side and
     * issues the NORMAL backend JWT (role HEALTH_WORKER). Each call creates a
     * new isolated session. No passwords or tokens are hardcoded client-side.
     */
    @PostMapping("/guest")
    public LoginResponse guest() {
        return authService.guestLogin();
    }

    /**
     * Guest Logout: deletes the temporary guest account and cascades all its
     * data so guest data does not linger until the next hourly cleanup.
     * Normal (doctor) sessions are stateless JWT — this is a no-op for them
     * (client-side token discard is sufficient).
     */
    @DeleteMapping("/session")
    public Map<String, String> logout(@AuthenticationPrincipal User user) {
        authService.deleteCurrentSession(user);
        return Map.of("status", "logged_out");
    }
}
