package com.dementiascreen.controller;

import com.dementiascreen.dto.ProfileRequest;
import com.dementiascreen.dto.ProfileResponse;
import com.dementiascreen.entity.User;
import com.dementiascreen.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/**
 * Authenticated profile endpoints. Note: this lives OUTSIDE /api/auth/** so that
 * Spring Security still enforces the JWT (SecurityConfig only permits /api/auth/**).
 */
@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final AuthService authService;

    public ProfileController(AuthService authService) {
        this.authService = authService;
    }

    @PatchMapping
    public ProfileResponse updateProfile(@AuthenticationPrincipal User user,
                                         @Valid @RequestBody ProfileRequest request) {
        return authService.updateProfile(user, request);
    }
}
