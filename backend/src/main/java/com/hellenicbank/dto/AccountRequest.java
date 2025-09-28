package com.hellenicbank.dto;

import com.hellenicbank.entity.Account;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AccountRequest {
    
    @NotNull(message = "Account type is required")
    private Account.AccountType type;
    
    private String nickname;
}
