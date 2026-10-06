package com.powerschool.backend.dto;

public class LoginResponse {

    private String token;
    private Long userId;
    private String username;
    private String fullName;
    private String email;
    private String role;

    public LoginResponse(
            String token,
            Long userId,
            String username,
            String fullName,
            String email,
            String role) {

        this.token = token;
        this.userId = userId;
        this.username = username;
        this.fullName = fullName;
        this.email = email;
        this.role = role;
    }

    public String getToken() {
        return token;
    }

    public Long getUserId() {
        return userId;
    }

    public String getUsername() {
        return username;
    }

    public String getFullName() {
        return fullName;
    }

    public String getEmail() {
        return email;
    }

    public String getRole() {
        return role;
    }
}
