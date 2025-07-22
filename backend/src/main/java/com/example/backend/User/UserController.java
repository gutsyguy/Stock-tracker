package com.example.backend.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/user")
public class UserController {
    @Autowired
    private JdbcTemplate jdbcTemplate;

    @PostMapping("/create")
    public String createUser(@RequestBody UserDTO userDTO){
        String email = userDTO.getEmail();

        try {
            String sql = "INSERT INTO users (email) VALUES (?) ON CONFLICT (email) DO NOTHING";

            jdbcTemplate.update(sql, email);

            return "";
        }
        catch (Exception err){
            err.printStackTrace();
            return "Error Inserting User";
        }
    }
}
