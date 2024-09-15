import { FaRegTrashAlt } from "react-icons/fa";
import { Product } from "../../../utils/interface";

interface AdminProductItemProp {
    products: Product[];
    product: Product;
    handleOpen: (pid: number) => void;
}

const AdminProductItem = ({ products, product, handleOpen }: AdminProductItemProp) => {
    const imageUrl = product.main_image ? product.main_image.replace(".jpg", "") : null;

    return (
        <tr>
            <td width="50px">{products.indexOf(product) + 1}</td>
            <td>
                <img
                    src={
                        imageUrl
                            ? `https://epgq6ejr4lgv8lec.public.blob.vercel-storage.com/uploads/${imageUrl}.jpg`
                            : require("../../../assets/images/product_placeholder.jpg")
                    }
                    alt={product.name}
                    style={{
                        height: "108px",
                        width: "144px",
                    }}
                />
            </td>
            <td width="450px">{product.name}</td>
            <td width="150px">{product.category}</td>
            <td width="150px">{product.brand}</td>
            <td width="150px">{product.price}</td>
            <td width="150px">{product.sale_price || "None"}</td>

            <td width="150px">{product.stock}</td>
            <td>
                <div>
                    {/* <button type="button">
                        <FaRegEdit />
                     </button> */}
                    <button type="button" onClick={() => handleOpen(product.id)}>
                        <FaRegTrashAlt />
                    </button>
                </div>
            </td>
        </tr>
    );
};

export default AdminProductItem;