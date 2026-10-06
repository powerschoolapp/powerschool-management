package com.powerschool.backend.config;

import com.powerschool.backend.entity.UserAccount;
import com.powerschool.backend.repository.UserAccountRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class AdminPasswordResetInitializer {

    @Value("${app.reset-admin-password:false}")
    private boolean resetAdminPassword;

    @Value("${app.initial-admin.username:}")
    private String username;

    @Value("${app.initial-admin.password:}")
    private String password;

    @Bean
    CommandLineRunner resetAdminPassword(
            UserAccountRepository userAccountRepository,
            PasswordEncoder passwordEncoder) {

        return args -> {

            if (!resetAdminPassword) {
                return;
            }

            if (username.isBlank() || password.isBlank()) {
                System.out.println(
                        "ADMIN PASSWORD RESET SKIPPED: "
                                + "admin username or password is missing."
                );
                return;
            }

            UserAccount admin = userAccountRepository
                    .findByUsername(username)
                    .orElse(null);

            if (admin == null) {
                System.out.println(
                        "ADMIN PASSWORD RESET SKIPPED: "
                                + "admin account was not found."
                );
                return;
            }

            admin.setPasswordHash(
                    passwordEncoder.encode(password)
            );

            userAccountRepository.save(admin);

            System.out.println(
                    "=== ADMIN PASSWORD RESET SUCCESSFULLY ==="
            );
        };
    }
}
