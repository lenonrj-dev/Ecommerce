import mongoose from "mongoose";

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI não configurada");
  }

  mongoose.connection.on('connected', () => {
    console.log("Banco de Dados Contectado");
  });

  await mongoose.connect(`${uri}/e-commerce`);
};

export default connectDB;
