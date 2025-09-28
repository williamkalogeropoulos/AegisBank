package com.hellenicbank.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

/**
 * Isolated Security Configuration
 * This configuration is specifically designed to protect authentication endpoints
 * and ensure they are completely isolated from other API changes.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class IsolatedSecurityConfig {
    
    private final JwtAuthenticationFilter jwtAuthFilter;
    private final CustomUserDetailsService userDetailsService;
    
    @Bean
    @Primary
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .authorizeHttpRequests(auth -> auth
                // CORS preflight requests
                .requestMatchers("OPTIONS", "/**").permitAll()
                
                // AUTHENTICATION ENDPOINTS - COMPLETELY ISOLATED
                .requestMatchers("/api/auth/**").permitAll()
                
                // USER PROFILE ENDPOINTS - Accessible to all authenticated users (MUST come before admin user endpoints)
                .requestMatchers("/api/users/me", "/api/users/me/**").authenticated()
                
                // ADMIN ENDPOINTS - Most specific patterns first
                .requestMatchers("/api/accounts/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/accounts/user/**").hasRole("ADMIN")
                .requestMatchers("/api/cards/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/cards/user/**").hasRole("ADMIN")
                .requestMatchers("/api/cards/all").hasRole("ADMIN")
                .requestMatchers("/api/loans/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/loans/user/**").hasRole("ADMIN")
                .requestMatchers("/api/transfers/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/transfers/user/**").hasRole("ADMIN")
                
                // USER MANAGEMENT ADMIN ENDPOINTS
                .requestMatchers("/api/users").hasRole("ADMIN")
                .requestMatchers("/api/users/{id}").hasRole("ADMIN")
                .requestMatchers("/api/users/{id}/**").hasRole("ADMIN")
                
                // ALL OTHER API ENDPOINTS REQUIRE AUTHENTICATION
                .requestMatchers("/api/**").authenticated()
                
                // ALLOW STATIC RESOURCES AND HEALTH CHECKS
                .requestMatchers("/", "/health", "/actuator/**").permitAll()
                
                // EVERYTHING ELSE REQUIRES AUTHENTICATION
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Allow all origins for development
        configuration.setAllowedOriginPatterns(Arrays.asList("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setExposedHeaders(Arrays.asList("Authorization", "Content-Type"));
        configuration.setMaxAge(3600L); // Cache preflight response for 1 hour
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
    
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }
    
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
