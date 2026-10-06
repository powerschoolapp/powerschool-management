package com.powerschool.backend.config;

import com.powerschool.backend.entity.UserAccount;
import com.powerschool.backend.entity.UserRole;
import com.powerschool.backend.repository.UserAccountRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class AdminInitializer {

    @Value("${app.initial-admin.username:}")
    private String username;

    @Value("${app.initial-admin.password:}")
    private String password;

    @Value("${app.initial-admin.full-name:}")
    private String fullName;

    @Value("${app.initial-admin.email:}")
    private String email;

    @Bean
    CommandLineRunner createInitialAdmin(
            UserAccountRepository userAccountRepository,
            PasswordEncoder passwordEncoder) {

        return args -> {

            System.out.println("=== ADMIN INITIALIZER STARTED ===");

            boolean adminExists = userAccountRepository.findAll()
                    .stream()
                    .anyMatch(user -> user.getRole() == UserRole.ADMIN);

            if (adminExists) {
                System.out.println("ADMIN account already exists.");
                return;
            }

            if (username.isBlank()
                    || password.isBlank()
                    || fullName.isBlank()
                    || email.isBlank()) {

                System.out.println(
                        "ADMIN account NOT created: "
                        + "one or more ADMIN configuration values are missing."
                );

                System.out.println(
                        "Username configured: " + !username.isBlank()
                );
                System.out.println(
                        "Full name configured: " + !fullName.isBlank()
                );
                System.out.println(
                        "Email configured: " + !email.isBlank()
                );

                return;
            }

            UserAccount admin = new UserAccount();

            admin.setUsername(username);
            admin.setPasswordHash(passwordEncoder.encode(password));
            admin.setFullName(fullName);
            admin.setEmail(email);
            admin.setRole(UserRole.ADMIN);
            admin.setEnabled(true);

            userAccountRepository.save(admin);

            System.out.println(
                    "=== INITIAL ADMIN ACCOUNT CREATED SUCCESSFULLY ==="
            );
        };
    }
}
