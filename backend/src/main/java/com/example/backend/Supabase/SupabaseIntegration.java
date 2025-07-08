// File: src/main/java/com/example/backend/Neon/NeonDBIntegration.java
// File: src/main/java/com/example/backend/Neon/NeonDBIntegration.java

package com.example.backend.Supabase;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class SupabaseIntegration {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @PostConstruct
    public void init() {
        try {
            jdbcTemplate.execute("SELECT 1");
            System.out.println("✅ Successfully connected to the Supabase database.");
        } catch (Exception e) {
            System.err.println("❌ Failed to connect to the Supabase database:");
            e.printStackTrace();
        }
    }
}
