package com.powerschool.backend.config;

import com.powerschool.backend.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http)
            throws Exception {

        http
            // Enable CORS configuration
            .cors(cors -> {})

            // JWT-based API: CSRF is not required
            .csrf(csrf -> csrf.disable())

            // No server-side sessions
            .sessionManagement(session ->
                session.sessionCreationPolicy(
                    SessionCreationPolicy.STATELESS
                )
            )

            .authorizeHttpRequests(auth -> auth

                // Public endpoints
                .requestMatchers(
                    "/api/health",
                    "/api/auth/login"
                ).permitAll()

                // ADMIN
                .requestMatchers("/api/admin/**")
                .hasRole("ADMIN")

                // TEACHER
                .requestMatchers("/api/teacher/**")
                .hasRole("TEACHER")

                // STUDENT
                .requestMatchers("/api/student/**")
                .hasRole("STUDENT")

                // All other endpoints require authentication
                .anyRequest()
                .authenticated()
            )

            // Disable browser authentication mechanisms
            .formLogin(form -> form.disable())
            .httpBasic(basic -> basic.disable())

            // JWT authentication filter
            .addFilterBefore(
                jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }
}
