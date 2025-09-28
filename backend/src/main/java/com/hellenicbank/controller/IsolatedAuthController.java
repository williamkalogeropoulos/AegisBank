package com.hellenicbank.controller;

import com.hellenicbank.dto.AuthRequest;
import com.hellenicbank.dto.AuthResponse;
import com.hellenicbank.dto.RegisterRequest;
import com.hellenicbank.entity.User;
import com.hellenicbank.security.CustomUserDetailsService;
import com.hellenicbank.security.JwtUtil;
import com.hellenicbank.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

/**
 * Isolated Authentication Controller
 * This controller is completely separate from other APIs to prevent interference.
 * It handles only authentication-related operations and is protected by specific security rules.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class IsolatedAuthController {
    
    private final AuthenticationManager authenticationManager;
    private final UserService userService;
    private final JwtUtil jwtUtil;
    
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            if (userService.existsByEmail(request.getEmail())) {
                return ResponseEntity.badRequest().body("Email already exists");
            }
            
            User user = new User();
            user.setName(request.getName());
            user.setEmail(request.getEmail());
            user.setPassword(request.getPassword());
            user.setRole(User.Role.USER);
            
            User savedUser = userService.createUser(user);
            
            String accessToken = jwtUtil.generateToken(savedUser);
            String refreshToken = jwtUtil.generateRefreshToken(savedUser);
            
            return ResponseEntity.ok(AuthResponse.fromUser(savedUser, accessToken, refreshToken));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Registration failed: " + e.getMessage());
        }
    }
    
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
            
            CustomUserDetailsService.CustomUserPrincipal userPrincipal = (CustomUserDetailsService.CustomUserPrincipal) authentication.getPrincipal();
            User user = userPrincipal.getUser();
            
            String accessToken = jwtUtil.generateToken(user);
            String refreshToken = jwtUtil.generateRefreshToken(user);
            
            return ResponseEntity.ok(AuthResponse.fromUser(user, accessToken, refreshToken));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@RequestBody String refreshToken) {
        try {
            if (!jwtUtil.validateToken(refreshToken) || !jwtUtil.isRefreshToken(refreshToken)) {
                return ResponseEntity.badRequest().build();
            }
            
            String email = jwtUtil.extractUsername(refreshToken);
            UserDetails userDetails = userService.loadUserByUsername(email);
            User user = ((CustomUserDetailsService.CustomUserPrincipal) userDetails).getUser();
            
            String newAccessToken = jwtUtil.generateToken(user);
            String newRefreshToken = jwtUtil.generateRefreshToken(user);
            
            return ResponseEntity.ok(AuthResponse.fromUser(user, newAccessToken, newRefreshToken));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        // For JWT-based auth, logout is handled client-side by removing the token
        // This endpoint exists for consistency and future enhancements
        return ResponseEntity.ok().build();
    }
}
