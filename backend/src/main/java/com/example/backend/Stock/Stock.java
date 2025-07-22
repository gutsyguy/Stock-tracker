package com.example.backend.Stock;

public class Stock {

    private String email;
    private String symbol;
    private Float shares;
    private Float purchasePrice;
    private Float currentPrice;

    // No-arg constructor
    public Stock() {}

    // All-args constructor
    public Stock(String email, String symbol, Float shares, Float purchasePrice, Float currentPrice) {
        this.email = email;
        this.symbol = symbol;
        this.shares = shares;
        this.purchasePrice = purchasePrice;
        this.currentPrice = currentPrice;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getSymbol() {
        return symbol;
    }

    public void setSymbol(String symbol) {
        this.symbol = symbol;
    }

    public Float getShares() {
        return shares;
    }

    public void setShares(Float shares) {
        this.shares = shares;
    }

    public Float getPurchasePrice() {
        return purchasePrice;
    }

    public void setPurchasePrice(Float purchasePrice) {
        this.purchasePrice = purchasePrice;
    }

    public Float getCurrentPrice() {
        return currentPrice;
    }

    public void setCurrentPrice(Float currentPrice) {
        this.currentPrice = currentPrice;
    }
}
