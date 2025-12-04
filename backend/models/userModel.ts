// backend/models/userModel.js
import mongoose from 'mongoose';

const AddressSchema = new mongoose.Schema(
  {
    fullName:   { type: String, default: "" },
    phone:      { type: String, default: "" },
    zip:        { type: String, default: "" },
    street:     { type: String, default: "" },
    number:     { type: String, default: "" },
    complement: { type: String, default: "" },
    neighborhood:{ type: String, default: "" },
    city:       { type: String, default: "" },
    state:      { type: String, default: "" },
    country:    { type: String, default: "Brasil" },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    // credenciais básicas
    name:     { type: String, required: true },
    email:    { type: String, required: true, unique: true },
    password: { type: String, required: true },

    // dados pessoais
    celular:    { type: String, default: "" },
    telefone:   { type: String, default: "" },
    whatsapp:   { type: String, default: "" },
    cpf:        { type: String, default: "" },
    nascimento: { type: String, default: "" },
    sexo:       { type: String, enum: ["masculino", "feminino"], default: "masculino" },
    promo:      { type: Boolean, default: false },

    // carrinho / recuperação
    cartData:            { type: Object, default: {} },
    resetPasswordToken:  { type: String },
    resetPasswordExpires:{ type: Date },

    // favoritos e endereço
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'product', default: [] }],
    address:   { type: AddressSchema, default: null },
  },
  {
    minimize: false,
    timestamps: true, // createdAt / updatedAt (ajuda no sort)
  }
);

const UserModel = mongoose.models.User || mongoose.model('User', userSchema);
export default UserModel;
