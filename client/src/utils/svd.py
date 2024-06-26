# -*- coding: utf-8 -*-
"""SVD.ipynb

Automatically generated by Colab.

Original file is located at
    https://colab.research.google.com/drive/1ph0BRHqmCuZSYsdUvJJ5UoxIyk0xCdiP
"""

import pandas as pd
import numpy as np
from scipy.sparse.linalg import svds
import json

# Load data
data = pd.read_csv("../utils/history.csv")  # Update filename here

# Create a user-item matrix (pivot table)
totalRecommendation = []

for UID in data["ID"].unique():
    personFilter = data["ID"].isin([UID])
    personalHistory = data[personFilter]

    user_item_matrix = personalHistory.pivot_table(
        index=["order_id"],  # Users as rows
        columns="product_id",  # Products as columns
        values="quantity",
        aggfunc="sum",
        fill_value=0,
    )

    # print(user_item_matrix.head)

    # Convert the DataFrame to a NumPy array
    user_item_matrix_array = user_item_matrix.to_numpy().astype(
        np.float64
    )  # Convert to NumPy array

    # Perform SVD (adjust k based on your dataset and desired accuracy-complexity trade-off)
    U, sigma, Vt = svds(user_item_matrix_array, k=1)  # Choose appropriate k

    # Reconstruct a low-rank approximation of the user-item matrix (optional)
    user_item_approx = np.dot(U, np.dot(np.diag(sigma), Vt))

    # Function to predict recommendations for a user (replace 'user_id' with actual ID)
    def recommend_products_for_latest(user_item_matrix, U, sigma, Vt, top_n=16):
        latest_order_id = user_item_matrix.index.max()  # Get the highest order ID
        i = user_item_matrix.index.get_loc(
            latest_order_id
        )  # Get the index of the latest order
        user_row = U[i]

        # Predict ratings for all items
        predicted_ratings = np.dot(user_row, Vt)

        # Get product IDs with the highest predicted ratings
        top_n_indices = np.argsort(predicted_ratings)[::-1][:top_n]
        recommended_product_ids = user_item_matrix.columns[top_n_indices].tolist()

        return {"user_id": UID, "products": recommended_product_ids}

    # Example usage: assuming 'user_id' is available
    recommended_products = recommend_products_for_latest(
        user_item_matrix=user_item_matrix, U=U, sigma=sigma, Vt=Vt
    )
    # print(recommended_products) # if you wish, you can print the values
    totalRecommendation += [recommended_products]
print(totalRecommendation)

with open("recommendations.json", "w") as f:
    json.dump(totalRecommendation, f, indent=1)
