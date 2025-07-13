package com.example.backend.Stock;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.web.bind.annotation.*;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

@RestController
@RequestMapping("/api/stock")
public class StockController {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    // Create a stock entry
    @PostMapping("/create")
    public String createStock(@RequestBody StockDTO stockDTO) {
        Stock stock = stockDTO.getStock();

        String sql = "INSERT INTO stock_purchases (user_email, stock_symbol, shares, purchase_price, current_price) " +
                "VALUES (?, ?, ?, ?, ?)";

        int rows = jdbcTemplate.update(sql,
                stock.getEmail(),
                stock.getSymbol(),
                stock.getShares(),
                stock.getPurchasePrice(),
                stock.getCurrentPrice()
        );

        return rows == 1 ? "Stock created successfully" : "Failed to create stock";
    }

    // Get all stocks for a user
    @GetMapping("/all")
    public List<Stock> getAllStocks(@RequestParam String email) {
        String sql = "SELECT * FROM stock_purchases WHERE user_email = ?";

        return jdbcTemplate.query(sql, new Object[]{email}, new StockRowMapper());
    }

    // Get a single stock by email and symbol
    @GetMapping("/get")
    public Stock getStockBySymbol(@RequestParam String email, @RequestParam String symbol) {
        String sql = "SELECT * FROM stock_purchases WHERE user_email = ? AND stock_symbol = ?";

        return jdbcTemplate.queryForObject(sql, new Object[]{email, symbol}, new StockRowMapper());
    }

    // RowMapper to map ResultSet to Stock object
    private static class StockRowMapper implements RowMapper<Stock> {
        @Override
        public Stock mapRow(ResultSet rs, int rowNum) throws SQLException {
            Stock stock = new Stock();
            stock.setEmail(rs.getString("user_email"));
            stock.setSymbol(rs.getString("stock_symbol"));
            stock.setShares(rs.getInt("shares"));
            stock.setPurchasePrice(rs.getFloat("purchase_price"));
            stock.setCurrentPrice(rs.getFloat("current_price"));
            return stock;
        }
    }
}
