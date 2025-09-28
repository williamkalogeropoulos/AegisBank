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
import org.springframework.web.bind.annotation.*;

// DISABLED - Using IsolatedAuthController instead
// @RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    
    private final AuthenticationManager authenticationManager;
    private final UserService userService;
    private final JwtUtil jwtUtil;
    
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        if (userService.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().build();
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
    }
    
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody AuthRequest request) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        
        CustomUserDetailsService.CustomUserPrincipal userPrincipal = (CustomUserDetailsService.CustomUserPrincipal) authentication.getPrincipal();
        User user = userPrincipal.getUser();
        
        String accessToken = jwtUtil.generateToken(user);
        String refreshToken = jwtUtil.generateRefreshToken(user);
        
        return ResponseEntity.ok(AuthResponse.fromUser(user, accessToken, refreshToken));
    }
    
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@RequestBody String refreshToken) {
        if (!jwtUtil.validateToken(refreshToken) || !jwtUtil.isRefreshToken(refreshToken)) {
            return ResponseEntity.badRequest().build();
        }
        
        String email = jwtUtil.extractUsername(refreshToken);
        User user = (User) userService.loadUserByUsername(email);
        
        String newAccessToken = jwtUtil.generateToken(user);
        String newRefreshToken = jwtUtil.generateRefreshToken(user);
        
        return ResponseEntity.ok(AuthResponse.fromUser(user, newAccessToken, newRefreshToken));
    }
}
