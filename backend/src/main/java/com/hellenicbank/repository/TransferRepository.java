package com.hellenicbank.repository;

import com.hellenicbank.entity.Account;
import com.hellenicbank.entity.Transfer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TransferRepository extends JpaRepository<Transfer, Long> {
    List<Transfer> findByFromAccount(Account account);
    List<Transfer> findByFromAccountUserId(Long userId);
    List<Transfer> findByStatus(Transfer.TransferStatus status);
    
    @Query("SELECT t FROM Transfer t WHERE t.fromAccount.user.id = :userId AND t.createdAt >= :startDate ORDER BY t.createdAt DESC")
    List<Transfer> findRecentTransfersByUserId(@Param("userId") Long userId, @Param("startDate") LocalDateTime startDate);
    
    @Query("SELECT t FROM Transfer t WHERE t.createdAt >= :startDate ORDER BY t.createdAt DESC")
    List<Transfer> findRecentTransfers(@Param("startDate") LocalDateTime startDate);
    
    // CRUD and search methods
    List<Transfer> findByTypeAndFromAccountUserId(Transfer.TransferType type, Long userId);
    
    @Query("SELECT t FROM Transfer t WHERE t.fromAccount.user.id = :userId AND t.createdAt BETWEEN :startDate AND :endDate ORDER BY t.createdAt DESC")
    List<Transfer> findByCreatedAtBetweenAndFromAccountUserId(@Param("startDate") LocalDateTime startDate, 
                                                             @Param("endDate") LocalDateTime endDate, 
                                                             @Param("userId") Long userId);
    
    @Query("SELECT t FROM Transfer t WHERE t.fromAccount.user.id = :userId AND t.createdAt BETWEEN :startDate AND :endDate ORDER BY t.createdAt DESC")
    List<Transfer> findByFromAccountUserIdAndCreatedAtBetween(@Param("userId") Long userId, 
                                                             @Param("startDate") LocalDateTime startDate, 
                                                             @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT t FROM Transfer t WHERE t.fromAccount.user.id = :userId AND t.amount BETWEEN :minAmount AND :maxAmount ORDER BY t.createdAt DESC")
    List<Transfer> findByAmountBetweenAndFromAccountUserId(@Param("minAmount") BigDecimal minAmount, 
                                                          @Param("maxAmount") BigDecimal maxAmount, 
                                                          @Param("userId") Long userId);
    
    List<Transfer> findByCategoryAndFromAccountUserId(String category, Long userId);
    
    // Admin methods
    List<Transfer> findByType(Transfer.TransferType type);
    
    @Query("SELECT t FROM Transfer t WHERE t.createdAt BETWEEN :startDate AND :endDate ORDER BY t.createdAt DESC")
    List<Transfer> findByCreatedAtBetween(@Param("startDate") LocalDateTime startDate, 
                                         @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT t FROM Transfer t WHERE t.amount BETWEEN :minAmount AND :maxAmount ORDER BY t.createdAt DESC")
    List<Transfer> findByAmountBetween(@Param("minAmount") BigDecimal minAmount, 
                                      @Param("maxAmount") BigDecimal maxAmount);
    
    List<Transfer> findByCategory(String category);
    
    // Delete methods for account cleanup
    void deleteByFromAccountId(Long accountId);
    
    // New methods for enhanced account functionality
    @Query("SELECT t FROM Transfer t WHERE t.fromAccount.id = :accountId ORDER BY t.createdAt DESC")
    List<Transfer> findByFromAccountIdOrToAccountId(@Param("accountId") Long accountId, @Param("accountId") Long accountId2);
    
    @Query("SELECT t FROM Transfer t WHERE t.fromAccount.id = :accountId AND t.createdAt BETWEEN :startDate AND :endDate ORDER BY t.createdAt DESC")
    List<Transfer> findByFromAccountIdOrToAccountIdAndCreatedAtBetween(@Param("accountId") Long accountId, 
                                                                      @Param("accountId") Long accountId2,
                                                                      @Param("startDate") LocalDateTime startDate, 
                                                                      @Param("endDate") LocalDateTime endDate);
}

