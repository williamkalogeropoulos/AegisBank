package com.hellenicbank.controller;

import com.hellenicbank.entity.User;
import com.hellenicbank.security.CustomUserDetailsService;
import com.hellenicbank.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    
    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    
    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUser(Authentication authentication) {
        CustomUserDetailsService.CustomUserPrincipal userPrincipal = (CustomUserDetailsService.CustomUserPrincipal) authentication.getPrincipal();
        User user = userPrincipal.getUser();
        return ResponseEntity.ok(user);
    }
    
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.findAll();
        return ResponseEntity.ok(users);
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createUser(@RequestBody User user) {
        try {
            if (userService.existsByEmail(user.getEmail())) {
                return ResponseEntity.badRequest().body("Email already exists");
            }
            User createdUser = userService.createUser(user);
            return ResponseEntity.ok(createdUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to create user: " + e.getMessage());
        }
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> getUser(@PathVariable Long id) {
        return userService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody User userUpdate) {
        try {
            return userService.findById(id)
                    .map(user -> {
                        user.setName(userUpdate.getName());
                        user.setEmail(userUpdate.getEmail());
                        user.setRole(userUpdate.getRole());
                        if (userUpdate.getPassword() != null && !userUpdate.getPassword().isEmpty()) {
                            user.setPassword(passwordEncoder.encode(userUpdate.getPassword()));
                        }
                        return ResponseEntity.ok(userService.updateUser(user));
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to update user: " + e.getMessage());
        }
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to delete user: " + e.getMessage());
        }
    }
    
    // Profile endpoints for current user
    @PutMapping("/me")
    public ResponseEntity<?> updateProfile(@RequestBody Map<String, String> profileData, Authentication authentication) {
        try {
            CustomUserDetailsService.CustomUserPrincipal userPrincipal = 
                (CustomUserDetailsService.CustomUserPrincipal) authentication.getPrincipal();
            User user = userPrincipal.getUser();
            
            if (profileData.containsKey("name")) {
                user.setName(profileData.get("name"));
            }
            if (profileData.containsKey("email")) {
                user.setEmail(profileData.get("email"));
            }
            
            User updatedUser = userService.updateUser(user);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to update profile: " + e.getMessage());
        }
    }
    
    @PutMapping("/me/password")
    public ResponseEntity<?> updatePassword(@RequestBody Map<String, String> passwordData, Authentication authentication) {
        try {
            CustomUserDetailsService.CustomUserPrincipal userPrincipal = 
                (CustomUserDetailsService.CustomUserPrincipal) authentication.getPrincipal();
            User user = userPrincipal.getUser();
            
            String currentPassword = passwordData.get("currentPassword");
            String newPassword = passwordData.get("newPassword");
            
            if (currentPassword == null || newPassword == null) {
                return ResponseEntity.badRequest().body("Current password and new password are required");
            }
            
            // Verify current password
            if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
                return ResponseEntity.badRequest().body("Current password is incorrect");
            }
            
            // Update password
            user.setPassword(passwordEncoder.encode(newPassword));
            userService.updateUser(user);
            
            return ResponseEntity.ok().body("Password updated successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to update password: " + e.getMessage());
        }
    }
}
