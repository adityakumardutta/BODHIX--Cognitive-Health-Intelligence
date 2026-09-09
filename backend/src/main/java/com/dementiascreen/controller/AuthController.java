package com.dementiascreen.controller;

import com.dementiascreen.dto.LoginRequest;
import com.dementiascreen.dto.LoginResponse;
import com.dementiascreen.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

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
     * Guest Login: authenticates the dedicated guest/demo account server-side
     * and issues the NORMAL backend JWT (role HEALTH_WORKER). No passwords or
     * tokens are hardcoded in the frontend and no authentication is bypassed.
     */
    @PostMapping("/guest")
    public LoginResponse guest() {
        return authService.guestLogin();
    }
}
