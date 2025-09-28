package com.hellenicbank.dto;

import com.hellenicbank.entity.Account;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class AccountResponse {
    
    private Long id;
    private Long userId;
    private Account.AccountType type;
    private String iban;
    private BigDecimal balance;
    private String currency;
    private Account.AccountStatus status;
    private String nickname;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // User information
    private String userName;
    private String userEmail;
    
    public AccountResponse(Account account) {
        this.id = account.getId();
        this.userId = account.getUser().getId();
        this.type = account.getType();
        this.iban = account.getIban();
        this.balance = account.getBalance();
        this.currency = account.getCurrency();
        this.status = account.getStatus();
        this.nickname = account.getNickname();
        this.createdAt = account.getCreatedAt();
        this.updatedAt = account.getUpdatedAt();
        
        // Include user information
        this.userName = account.getUser().getName();
        this.userEmail = account.getUser().getEmail();
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    
    public Account.AccountType getType() { return type; }
    public void setType(Account.AccountType type) { this.type = type; }
    
    public String getIban() { return iban; }
    public void setIban(String iban) { this.iban = iban; }
    
    public BigDecimal getBalance() { return balance; }
    public void setBalance(BigDecimal balance) { this.balance = balance; }
    
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    
    public Account.AccountStatus getStatus() { return status; }
    public void setStatus(Account.AccountStatus status) { this.status = status; }
    
    public String getNickname() { return nickname; }
    public void setNickname(String nickname) { this.nickname = nickname; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }
    
    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
}
