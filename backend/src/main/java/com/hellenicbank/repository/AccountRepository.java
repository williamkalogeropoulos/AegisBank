package com.hellenicbank.repository;

import com.hellenicbank.entity.Account;
import com.hellenicbank.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {
    List<Account> findByUser(User user);
    List<Account> findByUserId(Long userId);
    Optional<Account> findByIban(String iban);
    boolean existsByIban(String iban);
    List<Account> findByStatus(Account.AccountStatus status);
}

