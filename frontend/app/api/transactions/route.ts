import { NextRequest, NextResponse } from "next/server";
import { apiClient } from "@/app/services/api";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, symbol, transactionType, quantity, price } = body;

    if (!userId || !symbol || !transactionType || !quantity || !price) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // First, get the stock by symbol to get the stock ID
    const stockResponse = await apiClient.getStockBySymbol(symbol);
    if (stockResponse.error || !stockResponse.data) {
      return NextResponse.json(
        { error: "Stock not found" },
        { status: 404 }
      );
    }

    // Create the transaction
    const transactionData = {
      userId,
      stockId: stockResponse.data.id,
      transactionType: transactionType as 'BUY' | 'SELL',
      quantity: parseFloat(quantity),
      price: parseFloat(price),
    };

    const response = await apiClient.createTransaction(transactionData);
    
    if (response.error) {
      return NextResponse.json(
        { error: response.error },
        { status: 400 }
      );
    }

    return NextResponse.json({ 
      message: "Transaction created successfully",
      transaction: response.data 
    });
  } catch (error) {
    console.error("Transaction creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
