package com.hellenicbank.service;

import com.hellenicbank.entity.Account;
import com.hellenicbank.entity.User;
import com.hellenicbank.repository.AccountRepository;
import com.hellenicbank.repository.CardRepository;
import com.hellenicbank.repository.TransferRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Transactional
public class AccountService {
    
    private final AccountRepository accountRepository;
    private final CardRepository cardRepository;
    private final TransferRepository transferRepository;
    
    public Account createAccount(User user, Account.AccountType type) {
        return createAccount(user, type, null);
    }
    
    public Account createAccount(User user, Account.AccountType type, String nickname) {
        Account account = new Account();
        account.setUser(user);
        account.setType(type);
        
        // Generate unique IBAN
        String iban;
        do {
            iban = generateIban();
        } while (accountRepository.existsByIban(iban));
        
        account.setIban(iban);
        account.setBalance(BigDecimal.ZERO);
        account.setCurrency("EUR");
        // Set status to PENDING for admin approval
        account.setStatus(Account.AccountStatus.PENDING);
        account.setNickname(nickname);
        
        return accountRepository.save(account);
    }
    
    public Account createAccountAdmin(User user, Account.AccountType type, String nickname) {
        Account account = new Account();
        account.setUser(user);
        account.setType(type);
        
        // Generate unique IBAN
        String iban;
        do {
            iban = generateIban();
        } while (accountRepository.existsByIban(iban));
        
        account.setIban(iban);
        account.setBalance(BigDecimal.ZERO);
        account.setCurrency("EUR");
        // Admin can create accounts directly as ACTIVE
        account.setStatus(Account.AccountStatus.ACTIVE);
        account.setNickname(nickname);
        
        return accountRepository.save(account);
    }
    
    public List<Account> getUserAccounts(Long userId) {
        return accountRepository.findByUserId(userId);
    }
    
    public List<Account> getPendingAccounts() {
        return accountRepository.findByStatus(Account.AccountStatus.PENDING);
    }
    
    public Account approveAccount(Long accountId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new IllegalArgumentException("Account not found"));
        
        if (account.getStatus() != Account.AccountStatus.PENDING) {
            throw new IllegalArgumentException("Account is not pending approval");
        }
        
        account.setStatus(Account.AccountStatus.ACTIVE);
        account.setUpdatedAt(LocalDateTime.now());
        return accountRepository.save(account);
    }
    
    public void rejectAccount(Long accountId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new IllegalArgumentException("Account not found"));
        
        if (account.getStatus() != Account.AccountStatus.PENDING) {
            throw new IllegalArgumentException("Account is not pending approval");
        }
        
        accountRepository.delete(account);
    }
    
    public Account freezeAccount(Long accountId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new IllegalArgumentException("Account not found"));
        
        if (account.getStatus() == Account.AccountStatus.FROZEN) {
            throw new IllegalArgumentException("Account is already frozen");
        }
        
        account.setStatus(Account.AccountStatus.FROZEN);
        account.setUpdatedAt(LocalDateTime.now());
        return accountRepository.save(account);
    }
    
    public Account unfreezeAccount(Long accountId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new IllegalArgumentException("Account not found"));
        
        if (account.getStatus() != Account.AccountStatus.FROZEN) {
            throw new IllegalArgumentException("Account is not frozen");
        }
        
        account.setStatus(Account.AccountStatus.ACTIVE);
        account.setUpdatedAt(LocalDateTime.now());
        return accountRepository.save(account);
    }
    
    public List<Account> getAllAccounts() {
        return accountRepository.findAll();
    }
    
    public Optional<Account> findById(Long id) {
        return accountRepository.findById(id);
    }
    
    public Optional<Account> findByIban(String iban) {
        return accountRepository.findByIban(iban);
    }
    
    public Account updateAccount(Account account) {
        return accountRepository.save(account);
    }
    
    public void deleteAccount(Long id) {
        accountRepository.deleteById(id);
    }
    
    public void deleteAccountPermanently(Long id) {
        // First delete all related cards
        cardRepository.deleteByAccountId(id);
        
        // Then delete all related transfers (both from and to this account)
        transferRepository.deleteByFromAccountId(id);
        // Note: We can't easily delete transfers TO this account without knowing the account ID
        // For now, we'll leave incoming transfers as they reference the IBAN, not the account ID
        
        // Finally delete the account
        accountRepository.deleteById(id);
    }
    
    public boolean isAccountOwnedByUser(Long accountId, Long userId) {
        return accountRepository.findById(accountId)
                .map(account -> account.getUser().getId().equals(userId))
                .orElse(false);
    }
    
    public boolean canWithdraw(Long accountId, BigDecimal amount) {
        return accountRepository.findById(accountId)
                .map(account -> account.getBalance().compareTo(amount) >= 0 && 
                               account.getStatus() == Account.AccountStatus.ACTIVE)
                .orElse(false);
    }
    
    public void updateBalance(Long accountId, BigDecimal newBalance) {
        accountRepository.findById(accountId).ifPresent(account -> {
            account.setBalance(newBalance);
            accountRepository.save(account);
        });
    }
    
    @Transactional
    public Account cancelAccount(Long id) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Account not found"));
        
        if (account.getStatus() == Account.AccountStatus.CANCELLED) {
            throw new IllegalArgumentException("Account is already cancelled");
        }
        
        // If it's a loan account, we need to handle the loan cancellation
        if (account.getType() == Account.AccountType.LOAN) {
            // Find the associated loan and cancel it
            // This is a simplified approach - in production you'd have a proper relationship
            System.out.println("Cancelling loan account: " + account.getIban());
        }
        
        // Set status to cancelled
        account.setStatus(Account.AccountStatus.CANCELLED);
        account.setUpdatedAt(LocalDateTime.now());
        
        return accountRepository.save(account);
    }
    
    
    private String generateIban() {
        // Generate a simple IBAN for demo purposes
        // In production, this should follow proper IBAN generation rules
        Random random = new Random();
        StringBuilder iban = new StringBuilder("GR");
        
        // Add check digits
        iban.append(String.format("%02d", random.nextInt(100)));
        
        // Add bank code
        iban.append("1234");
        
        // Add account number
        iban.append(String.format("%016d", random.nextLong(10000000000000000L)));
        
        return iban.toString();
    }
}

