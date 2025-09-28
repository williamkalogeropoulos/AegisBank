package com.hellenicbank.config;

import com.hellenicbank.entity.Account;
import com.hellenicbank.entity.User;
import com.hellenicbank.service.AccountService;
import com.hellenicbank.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {
    
    private final UserService userService;
    private final AccountService accountService;
    private final PasswordEncoder passwordEncoder;
    
    @Override
    public void run(String... args) throws Exception {
        // Remove William user if it exists
        try {
            if (userService.existsByEmail("williamkalogeropoulos@gmail.com")) {
                User williamUser = userService.findByEmail("williamkalogeropoulos@gmail.com").orElse(null);
                if (williamUser != null) {
                    userService.deleteUser(williamUser.getId());
                    log.info("William user removed successfully");
                }
            }
        } catch (Exception e) {
            log.info("William user removal failed or user doesn't exist: {}", e.getMessage());
        }
        
        // Create admin user if it doesn't exist
        User admin = null;
        if (!userService.existsByEmail("admin@aegisbank.com")) {
            admin = new User();
            admin.setName("Admin User");
            admin.setEmail("admin@aegisbank.com");
            admin.setPassword("admin123");
            admin.setRole(User.Role.ADMIN);
            
            admin = userService.createUser(admin);
            log.info("Admin user created successfully");
        } else {
            admin = userService.findByEmail("admin@aegisbank.com").orElse(null);
            log.info("Admin user already exists");
        }
        
        // Create demo user if it doesn't exist
        User demoUser = null;
        if (!userService.existsByEmail("demo@aegisbank.com")) {
            demoUser = new User();
            demoUser.setName("Demo User");
            demoUser.setEmail("demo@aegisbank.com");
            demoUser.setPassword("demo123");
            demoUser.setRole(User.Role.USER);
            
            demoUser = userService.createUser(demoUser);
            log.info("Demo user created successfully");
        } else {
            demoUser = userService.findByEmail("demo@aegisbank.com").orElse(null);
            log.info("Demo user already exists");
        }
        
        // Create mock user if it doesn't exist
        User mockUser = null;
        if (!userService.existsByEmail("mock@aegisbank.com")) {
            mockUser = new User();
            mockUser.setName("Mock User");
            mockUser.setEmail("mock@aegisbank.com");
            mockUser.setPassword("mock123");
            mockUser.setRole(User.Role.USER);
            
            mockUser = userService.createUser(mockUser);
            log.info("Mock user created successfully");
        } else {
            mockUser = userService.findByEmail("mock@aegisbank.com").orElse(null);
            log.info("Mock user already exists");
        }
        
        // Create mock accounts
        if (admin != null) {
            createMockAccounts(admin);
        }
        
        if (demoUser != null) {
            createMockAccounts(demoUser);
        }
        
        if (mockUser != null) {
            createMockAccounts(mockUser);
        }
        
        // Create William Kalogeropoulos admin user if it doesn't exist
        User williamAdmin = null;
        if (!userService.existsByEmail("william@aegisbank.com")) {
            williamAdmin = new User();
            williamAdmin.setName("William Kalogeropoulos");
            williamAdmin.setEmail("william@aegisbank.com");
            williamAdmin.setPassword("William123");
            williamAdmin.setRole(User.Role.ADMIN);
            
            williamAdmin = userService.createUser(williamAdmin);
            log.info("William Kalogeropoulos admin user created successfully");
        } else {
            williamAdmin = userService.findByEmail("william@aegisbank.com").orElse(null);
            log.info("William Kalogeropoulos admin user already exists");
            
            // Reset admin password to known value
            if (williamAdmin != null) {
                williamAdmin.setPassword(passwordEncoder.encode("William123"));
                williamAdmin = userService.updateUser(williamAdmin);
                log.info("Admin password reset to: William123");
            }
        }
        
        if (williamAdmin != null) {
            createMockAccounts(williamAdmin);
        }
        
        // Mock user starts with no accounts - they need to request them
        
    }
    
    private void createMockAccounts(User user) {
        // Always create mock accounts for testing (will skip if they already exist due to unique constraints)
        try {
            // Create a checking account
            Account checkingAccount = accountService.createAccount(user, Account.AccountType.CHECKING);
            checkingAccount.setBalance(new java.math.BigDecimal("5000.00")); // Set initial balance
            accountService.updateAccount(checkingAccount);
            log.info("Mock checking account created with balance: €5000.00");
        } catch (Exception e) {
            log.info("Checking account might already exist: {}", e.getMessage());
        }
        
        try {
            // Create a savings account
            Account savingsAccount = accountService.createAccount(user, Account.AccountType.SAVINGS);
            savingsAccount.setBalance(new java.math.BigDecimal("10000.00")); // Set initial balance
            accountService.updateAccount(savingsAccount);
            log.info("Mock savings account created with balance: €10000.00");
        } catch (Exception e) {
            log.info("Savings account might already exist: {}", e.getMessage());
        }
    }
    
}


