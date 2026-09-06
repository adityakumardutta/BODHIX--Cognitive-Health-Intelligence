package com.dementiascreen.controller;

import com.dementiascreen.dto.FirebaseAuthRequest;
import com.dementiascreen.dto.GoogleAuthRequest;
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

    @PostMapping("/google")
    public LoginResponse google(@Valid @RequestBody GoogleAuthRequest request) {
        return authService.googleLogin(request);
    }

    /** Firebase Google sign-in: verifies the ID token server-side, then issues the normal BODHIX JWT. */
    @PostMapping("/firebase")
    public LoginResponse firebase(@Valid @RequestBody FirebaseAuthRequest request) {
        return authService.firebaseLogin(request);
    }
}
