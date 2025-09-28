package com.hellenicbank.service;

import com.hellenicbank.dto.TransferRequest;
import com.hellenicbank.dto.TransferResponse;
import com.hellenicbank.dto.UpdateTransferRequest;
import com.hellenicbank.entity.Account;
import com.hellenicbank.entity.Transfer;
import com.hellenicbank.repository.AccountRepository;
import com.hellenicbank.repository.TransferRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class TransferService {
    
    private final TransferRepository transferRepository;
    private final AccountService accountService;
    private final AccountRepository accountRepository;
    
    private static final BigDecimal EXTERNAL_BANK_FEE = new BigDecimal("0.50");
    
    public Transfer createTransfer(TransferRequest request, Long userId) {
        // Verify account ownership
        if (!accountService.isAccountOwnedByUser(request.getFromAccountId(), userId)) {
            throw new IllegalArgumentException("Account not found or not owned by user");
        }
        
        Account fromAccount = accountService.findById(request.getFromAccountId())
                .orElseThrow(() -> new IllegalArgumentException("Source account not found"));
        
        // Determine transfer type and calculate fees
        Transfer.TransferType transferType = determineTransferType(request, userId);
        BigDecimal fee = calculateFee(transferType);
        BigDecimal totalAmount = request.getAmount().add(fee);
        
        // Check if account can withdraw total amount (including fee)
        if (!accountService.canWithdraw(request.getFromAccountId(), totalAmount)) {
            throw new IllegalArgumentException("Insufficient funds or account frozen");
        }
        
        // Create transfer
        Transfer transfer = new Transfer();
        transfer.setFromAccount(fromAccount);
        transfer.setToIban(request.getToIban());
        transfer.setAmount(request.getAmount());
        transfer.setFee(fee);
        transfer.setTotalAmount(totalAmount);
        transfer.setDescription(request.getDescription());
        transfer.setCategory(request.getCategory());
        transfer.setType(transferType);
        transfer.setStatus(Transfer.TransferStatus.PENDING);
        
        return transferRepository.save(transfer);
    }
    
    public Transfer createTransfer(Long fromAccountId, String toIban, BigDecimal amount, 
                                 String description, String category, Long userId) {
        TransferRequest request = new TransferRequest();
        request.setFromAccountId(fromAccountId);
        request.setToIban(toIban);
        request.setAmount(amount);
        request.setDescription(description);
        request.setCategory(category);
        return createTransfer(request, userId);
    }
    
    public Transfer createInterAccountTransfer(Long fromAccountId, Long toAccountId, BigDecimal amount, 
                                             String description, String category, Long userId) {
        // Verify both accounts are owned by the user
        if (!accountService.isAccountOwnedByUser(fromAccountId, userId)) {
            throw new IllegalArgumentException("Source account not found or not owned by user");
        }
        if (!accountService.isAccountOwnedByUser(toAccountId, userId)) {
            throw new IllegalArgumentException("Destination account not found or not owned by user");
        }
        
        Account fromAccount = accountService.findById(fromAccountId)
                .orElseThrow(() -> new IllegalArgumentException("Source account not found"));
        Account toAccount = accountService.findById(toAccountId)
                .orElseThrow(() -> new IllegalArgumentException("Destination account not found"));
        
        // Check if account can withdraw amount
        if (!accountService.canWithdraw(fromAccountId, amount)) {
            throw new IllegalArgumentException("Insufficient funds or account frozen");
        }
        
        // Create transfer
        Transfer transfer = new Transfer();
        transfer.setFromAccount(fromAccount);
        transfer.setToIban(toAccount.getIban());
        transfer.setAmount(amount);
        transfer.setFee(BigDecimal.ZERO); // No fee for inter-account transfers
        transfer.setTotalAmount(amount);
        transfer.setDescription(description);
        transfer.setCategory(category);
        transfer.setType(Transfer.TransferType.INTER_ACCOUNT);
        transfer.setStatus(Transfer.TransferStatus.PENDING);
        
        return transferRepository.save(transfer);
    }
    
    private Transfer.TransferType determineTransferType(TransferRequest request, Long userId) {
        // Check if it's an inter-account transfer (user's own accounts)
        if (request.getToAccountId() != null) {
            if (accountService.isAccountOwnedByUser(request.getToAccountId(), userId)) {
                return Transfer.TransferType.INTER_ACCOUNT;
            }
        }
        
        // Check if it's to another Aegis Bank account
        Optional<Account> toAccount = accountRepository.findByIban(request.getToIban());
        if (toAccount.isPresent()) {
            return Transfer.TransferType.INTERNAL;
        }
        
        // Default to external bank transfer
        return Transfer.TransferType.EXTERNAL;
    }
    
    private BigDecimal calculateFee(Transfer.TransferType type) {
        switch (type) {
            case EXTERNAL:
                return EXTERNAL_BANK_FEE;
            case INTERNAL:
            case INTER_ACCOUNT:
            default:
                return BigDecimal.ZERO;
        }
    }
    
    public Transfer processTransfer(Long transferId, Long userId) {
        Transfer transfer = transferRepository.findById(transferId)
                .orElseThrow(() -> new IllegalArgumentException("Transfer not found"));
        
        // Check if user owns the transfer or is admin
        if (!transfer.getFromAccount().getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("You can only process your own transfers");
        }
        
        if (transfer.getStatus() != Transfer.TransferStatus.PENDING) {
            throw new IllegalArgumentException("Transfer is not in pending status");
        }
        
        try {
            // Deduct total amount (including fee) from source account
            Account fromAccount = transfer.getFromAccount();
            BigDecimal newBalance = fromAccount.getBalance().subtract(transfer.getTotalAmount());
            accountService.updateBalance(fromAccount.getId(), newBalance);
            
            // Handle different transfer types
            switch (transfer.getType()) {
                case INTER_ACCOUNT:
                    // Transfer to user's own account
                    processInterAccountTransfer(transfer);
                    break;
                case INTERNAL:
                    // Transfer to another Aegis Bank account
                    processInternalTransfer(transfer);
                    break;
                case EXTERNAL:
                default:
                    // External bank transfer - just deduct from source
                    break;
            }
            
            // Update transfer status
            transfer.setStatus(Transfer.TransferStatus.COMPLETED);
            return transferRepository.save(transfer);
            
        } catch (Exception e) {
            transfer.setStatus(Transfer.TransferStatus.FAILED);
            transferRepository.save(transfer);
            throw new RuntimeException("Transfer processing failed", e);
        }
    }
    
    public Transfer processTransferAdmin(Long transferId) {
        Transfer transfer = transferRepository.findById(transferId)
                .orElseThrow(() -> new IllegalArgumentException("Transfer not found"));
        
        if (transfer.getStatus() != Transfer.TransferStatus.PENDING) {
            throw new IllegalArgumentException("Transfer is not in pending status");
        }
        
        try {
            // Deduct total amount (including fee) from source account
            Account fromAccount = transfer.getFromAccount();
            BigDecimal newBalance = fromAccount.getBalance().subtract(transfer.getTotalAmount());
            accountService.updateBalance(fromAccount.getId(), newBalance);
            
            // Handle different transfer types
            switch (transfer.getType()) {
                case INTER_ACCOUNT:
                    // Transfer to user's own account
                    processInterAccountTransfer(transfer);
                    break;
                case INTERNAL:
                    // Transfer to another Aegis Bank account
                    processInternalTransfer(transfer);
                    break;
                case EXTERNAL:
                default:
                    // External bank transfer - just deduct from source
                    break;
            }
            
            // Update transfer status
            transfer.setStatus(Transfer.TransferStatus.COMPLETED);
            return transferRepository.save(transfer);
            
        } catch (Exception e) {
            transfer.setStatus(Transfer.TransferStatus.FAILED);
            transferRepository.save(transfer);
            throw new RuntimeException("Transfer processing failed", e);
        }
    }
    
    private void processInterAccountTransfer(Transfer transfer) {
        // Find the destination account
        Optional<Account> toAccount = accountRepository.findByIban(transfer.getToIban());
        if (toAccount.isPresent()) {
            // Add amount to destination account
            Account destAccount = toAccount.get();
            BigDecimal newBalance = destAccount.getBalance().add(transfer.getAmount());
            accountService.updateBalance(destAccount.getId(), newBalance);
        }
    }
    
    private void processInternalTransfer(Transfer transfer) {
        // Find the destination account
        Optional<Account> toAccount = accountRepository.findByIban(transfer.getToIban());
        if (toAccount.isPresent()) {
            // Add amount to destination account
            Account destAccount = toAccount.get();
            BigDecimal newBalance = destAccount.getBalance().add(transfer.getAmount());
            accountService.updateBalance(destAccount.getId(), newBalance);
        }
    }
    
    public List<Transfer> getUserTransfers(Long userId) {
        return transferRepository.findByFromAccountUserId(userId);
    }
    
    public List<Transfer> getAllTransfers() {
        return transferRepository.findAll();
    }
    
    public List<Transfer> getRecentTransfers(Long userId, int days) {
        LocalDateTime startDate = LocalDateTime.now().minusDays(days);
        return transferRepository.findRecentTransfersByUserId(userId, startDate);
    }
    
    public List<Transfer> getRecentTransfers(int days) {
        LocalDateTime startDate = LocalDateTime.now().minusDays(days);
        return transferRepository.findRecentTransfers(startDate);
    }
    
    public Optional<Transfer> findById(Long id) {
        return transferRepository.findById(id);
    }
    
    public Transfer updateTransferStatus(Long transferId, Transfer.TransferStatus status) {
        Transfer transfer = transferRepository.findById(transferId)
                .orElseThrow(() -> new IllegalArgumentException("Transfer not found"));
        
        transfer.setStatus(status);
        return transferRepository.save(transfer);
    }
    
    public List<Transfer> getTransfersByStatus(Transfer.TransferStatus status) {
        return transferRepository.findByStatus(status);
    }
    
    // UPDATE operations
    public Transfer updateTransfer(Long transferId, UpdateTransferRequest request, Long userId) {
        Transfer transfer = transferRepository.findById(transferId)
                .orElseThrow(() -> new IllegalArgumentException("Transfer not found"));
        
        // Check ownership or admin access
        if (!transfer.getFromAccount().getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Transfer not found or access denied");
        }
        
        // Only allow updates to PENDING transfers
        if (transfer.getStatus() != Transfer.TransferStatus.PENDING) {
            throw new IllegalArgumentException("Only pending transfers can be updated");
        }
        
        // Update fields
        if (request.getAmount() != null) {
            // Recalculate fee and total amount
            BigDecimal fee = calculateFee(transfer.getType());
            BigDecimal totalAmount = request.getAmount().add(fee);
            
            // Check if account can still afford the new amount
            if (!accountService.canWithdraw(transfer.getFromAccount().getId(), totalAmount)) {
                throw new IllegalArgumentException("Insufficient funds for updated amount");
            }
            
            transfer.setAmount(request.getAmount());
            transfer.setFee(fee);
            transfer.setTotalAmount(totalAmount);
        }
        
        if (request.getDescription() != null) {
            transfer.setDescription(request.getDescription());
        }
        
        if (request.getCategory() != null) {
            transfer.setCategory(request.getCategory());
        }
        
        if (request.getStatus() != null) {
            transfer.setStatus(request.getStatus());
        }
        
        if (request.getToIban() != null && !request.getToIban().equals(transfer.getToIban())) {
            // Update IBAN and recalculate transfer type
            transfer.setToIban(request.getToIban());
            Transfer.TransferType newType = determineTransferTypeFromIban(request.getToIban(), userId);
            transfer.setType(newType);
            
            // Recalculate fee based on new type
            BigDecimal newFee = calculateFee(newType);
            transfer.setFee(newFee);
            transfer.setTotalAmount(transfer.getAmount().add(newFee));
        }
        
        return transferRepository.save(transfer);
    }
    
    // DELETE operations
    public void deleteTransfer(Long transferId, Long userId) {
        Transfer transfer = transferRepository.findById(transferId)
                .orElseThrow(() -> new IllegalArgumentException("Transfer not found"));
        
        // Check ownership or admin access
        if (!transfer.getFromAccount().getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Transfer not found or access denied");
        }
        
        // Only allow deletion of PENDING transfers
        if (transfer.getStatus() != Transfer.TransferStatus.PENDING) {
            throw new IllegalArgumentException("Only pending transfers can be deleted");
        }
        
        transferRepository.delete(transfer);
    }
    
    // Admin DELETE operations
    public void deleteTransferAdmin(Long transferId) {
        Transfer transfer = transferRepository.findById(transferId)
                .orElseThrow(() -> new IllegalArgumentException("Transfer not found"));
        
        // Admin can delete any transfer, but warn if it's completed
        if (transfer.getStatus() == Transfer.TransferStatus.COMPLETED) {
            // For completed transfers, we might want to reverse the transaction
            // This is a complex operation that should be handled carefully
            throw new IllegalArgumentException("Cannot delete completed transfers. Use reversal process instead.");
        }
        
        transferRepository.delete(transfer);
    }
    
    // REVERSE operations (for completed transfers)
    public Transfer reverseTransfer(Long transferId) {
        Transfer transfer = transferRepository.findById(transferId)
                .orElseThrow(() -> new IllegalArgumentException("Transfer not found"));
        
        if (transfer.getStatus() != Transfer.TransferStatus.COMPLETED) {
            throw new IllegalArgumentException("Only completed transfers can be reversed");
        }
        
        try {
            // Reverse the transaction
            Account fromAccount = transfer.getFromAccount();
            BigDecimal newBalance = fromAccount.getBalance().add(transfer.getTotalAmount());
            accountService.updateBalance(fromAccount.getId(), newBalance);
            
            // Handle different transfer types for reversal
            switch (transfer.getType()) {
                case INTER_ACCOUNT:
                case INTERNAL:
                    // Remove amount from destination account
                    Optional<Account> toAccount = accountRepository.findByIban(transfer.getToIban());
                    if (toAccount.isPresent()) {
                        Account destAccount = toAccount.get();
                        BigDecimal destNewBalance = destAccount.getBalance().subtract(transfer.getAmount());
                        accountService.updateBalance(destAccount.getId(), destNewBalance);
                    }
                    break;
                case EXTERNAL:
                default:
                    // External transfers - just refund the source account
                    break;
            }
            
            // Mark as reversed
            transfer.setStatus(Transfer.TransferStatus.FAILED);
            transfer.setDescription(transfer.getDescription() + " [REVERSED]");
            return transferRepository.save(transfer);
            
        } catch (Exception e) {
            throw new RuntimeException("Transfer reversal failed", e);
        }
    }
    
    // Helper method to determine transfer type from IBAN
    private Transfer.TransferType determineTransferTypeFromIban(String toIban, Long userId) {
        // Check if it's to another Aegis Bank account
        Optional<Account> toAccount = accountRepository.findByIban(toIban);
        if (toAccount.isPresent()) {
            // Check if it's user's own account
            if (toAccount.get().getUser().getId().equals(userId)) {
                return Transfer.TransferType.INTER_ACCOUNT;
            } else {
                return Transfer.TransferType.INTERNAL;
            }
        }
        
        // Default to external bank transfer
        return Transfer.TransferType.EXTERNAL;
    }
    
    // SEARCH and FILTER operations
    public List<Transfer> getTransfersByType(Transfer.TransferType type, Long userId) {
        if (userId != null) {
            return transferRepository.findByTypeAndFromAccountUserId(type, userId);
        } else {
            return transferRepository.findByType(type);
        }
    }
    
    public List<Transfer> getTransfersByDateRange(LocalDateTime startDate, LocalDateTime endDate, Long userId) {
        return transferRepository.findByCreatedAtBetweenAndFromAccountUserId(startDate, endDate, userId);
    }
    
    public List<Transfer> getTransfersByAmountRange(BigDecimal minAmount, BigDecimal maxAmount, Long userId) {
        return transferRepository.findByAmountBetweenAndFromAccountUserId(minAmount, maxAmount, userId);
    }
    
    public List<Transfer> getTransfersByCategory(String category, Long userId) {
        return transferRepository.findByCategoryAndFromAccountUserId(category, userId);
    }
    
    // New methods for enhanced account functionality
    public List<TransferResponse> getAccountTransactions(Long accountId) {
        List<Transfer> transfers = transferRepository.findByFromAccountIdOrToAccountId(accountId, accountId);
        return transfers.stream()
                .map(this::convertToTransferResponse)
                .collect(Collectors.toList());
    }
    
    public byte[] generateStatement(Long accountId, LocalDate startDate, LocalDate endDate, String format) {
        LocalDateTime startDateTime = startDate.atStartOfDay();
        LocalDateTime endDateTime = endDate.atTime(23, 59, 59);
        
        List<Transfer> transfers = transferRepository.findByFromAccountIdOrToAccountIdAndCreatedAtBetween(
            accountId, accountId, startDateTime, endDateTime);
        
        if (format.equalsIgnoreCase("PDF")) {
            return generatePDFStatement(transfers, accountId, startDate, endDate);
        } else {
            return generateCSVStatement(transfers, accountId, startDate, endDate);
        }
    }
    
    private byte[] generatePDFStatement(List<Transfer> transfers, Long accountId, LocalDate startDate, LocalDate endDate) {
        // Mock PDF generation - in a real application, you'd use a library like iText
        String content = "Aegis Bank Statement\n" +
                        "Account ID: " + accountId + "\n" +
                        "Period: " + startDate + " to " + endDate + "\n" +
                        "Transactions:\n";
        
        for (Transfer transfer : transfers) {
            content += transfer.getCreatedAt() + " - " + transfer.getAmount() + " - " + 
                      (transfer.getDescription() != null ? transfer.getDescription() : "Transfer") + "\n";
        }
        
        return content.getBytes();
    }
    
    private byte[] generateCSVStatement(List<Transfer> transfers, Long accountId, LocalDate startDate, LocalDate endDate) {
        StringBuilder csv = new StringBuilder();
        csv.append("Date,Amount,Description,Status,Reference\n");
        
        for (Transfer transfer : transfers) {
            csv.append(transfer.getCreatedAt().toLocalDate())
               .append(",")
               .append(transfer.getAmount())
               .append(",")
               .append(transfer.getDescription() != null ? transfer.getDescription() : "Transfer")
               .append(",")
               .append(transfer.getStatus())
               .append(",")
               .append(transfer.getReference() != null ? transfer.getReference() : "")
               .append("\n");
        }
        
        return csv.toString().getBytes();
    }
    
    @Transactional
    public Transfer cancelTransfer(Long transferId) {
        Transfer transfer = transferRepository.findById(transferId)
                .orElseThrow(() -> new IllegalArgumentException("Transfer not found"));
        
        if (transfer.getStatus() == Transfer.TransferStatus.CANCELLED) {
            throw new IllegalArgumentException("Transfer is already cancelled");
        }
        
        if (transfer.getStatus() == Transfer.TransferStatus.COMPLETED) {
            throw new IllegalArgumentException("Cannot cancel a completed transfer");
        }
        
        // Set status to cancelled
        transfer.setStatus(Transfer.TransferStatus.CANCELLED);
        transfer.setUpdatedAt(LocalDateTime.now());
        
        return transferRepository.save(transfer);
    }
    
    private TransferResponse convertToTransferResponse(Transfer transfer) {
        return new TransferResponse(transfer);
    }
}



