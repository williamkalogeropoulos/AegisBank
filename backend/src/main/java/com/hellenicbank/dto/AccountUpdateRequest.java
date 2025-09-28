package com.hellenicbank.dto;

import com.hellenicbank.entity.Account;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class AccountUpdateRequest {
    
    private Account.AccountType type;
    private Account.AccountStatus status;
    private BigDecimal balance;
    private String nickname;
}
