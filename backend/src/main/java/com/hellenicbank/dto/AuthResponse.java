package com.hellenicbank.dto;

import com.hellenicbank.entity.User;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private String tokenType = "Bearer";
    private UserInfo user;
    
    @Data
    @AllArgsConstructor
    public static class UserInfo {
        private Long id;
        private String name;
        private String email;
        private String role;
    }
    
    public static AuthResponse fromUser(User user, String accessToken, String refreshToken) {
        UserInfo userInfo = new UserInfo(
            user.getId(),
            user.getName(),
            user.getEmail(),
            user.getRole().name()
        );
        return new AuthResponse(accessToken, refreshToken, "Bearer", userInfo);
    }
}














