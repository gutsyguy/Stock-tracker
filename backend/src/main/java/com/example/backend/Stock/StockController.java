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

    @GetMapping("/all")
    public List<Stock> getAllStocks(@RequestParam String email) {
        String sql = "SELECT * FROM stock_purchases WHERE user_email = ?";

        return jdbcTemplate.query(sql, new Object[]{email}, new StockRowMapper());
    }

    @GetMapping("/get")
    public Stock getStockBySymbol(@RequestParam String email, @RequestParam String symbol) {
        String sql = "SELECT * FROM stock_purchases WHERE user_email = ? AND stock_symbol = ?";

        return jdbcTemplate.queryForObject(sql, new Object[]{email, symbol}, new StockRowMapper());
    }

    @PutMapping("/update")
    public String updateShares(@RequestBody StockDTO stockDTO) {
        Stock stock = stockDTO.getStock();

        String sql = "UPDATE stock_purchases SET shares = ? " +
                "WHERE user_email = ? AND stock_symbol = ?";

        int rows = jdbcTemplate.update(sql,
                stock.getShares(),
                stock.getEmail(),
                stock.getSymbol()
        );

        return rows == 1 ? "Shares updated successfully" : "Failed to update shares";
    }

    @DeleteMapping("/delete")
    public String deleteStock(@RequestParam String email, @RequestParam String symbol) {
        String sql = "DELETE FROM stock_purchases WHERE user_email = ? AND stock_symbol = ?";

        int rows = jdbcTemplate.update(sql, email, symbol);

        return rows == 1 ? "Stock deleted successfully" : "Failed to delete stock";
    }

    private static class StockRowMapper implements RowMapper<Stock> {
        @Override
        public Stock mapRow(ResultSet rs, int rowNum) throws SQLException {
            Stock stock = new Stock();
            stock.setEmail(rs.getString("user_email"));
            stock.setSymbol(rs.getString("stock_symbol"));
            stock.setShares(rs.getFloat("shares"));
            stock.setPurchasePrice(rs.getFloat("purchase_price"));
            stock.setCurrentPrice(rs.getFloat("current_price"));
            return stock;
        }
    }
}
