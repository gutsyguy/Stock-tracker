package com.example.backend.Neon;

import java.sql.*;


public class NeonDBIntegration {
    private static final String DB_URL = "jdbc:postgresql://localhost:5432/neon";
    private static final String DB_USER = "postgres";
    private static final String DB_PASSWORD = "password";

    public static void main(String[] args) {
        try (
            Connection connection = DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD);
            Statement statement = connection.createStatement();
            ResultSet resultSet = statement.executeQuery("SELECT * FROM users");
        ) {
            while (resultSet.next()) {
                System.out.println(resultSet.getString("name"));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

}