import { useEffect, useState } from "react";
import api from "../api";
import { Card } from "@/components/ui/card"; // shadcn/ui
import { Button } from "@/components/ui/button"; // shadcn/ui
import { Input } from "@/components/ui/input"; // shadcn/ui


export default function Dashboard() {
  const [properties, setProperties] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");

  const fetchProperties = async () => {
    const res = await api.get("/properties");
    setProperties(res.data);
  };

  const createProperty = async () => {
    await api.post("/properties", { name, address });
    setName("");
    setAddress("");
    fetchProperties();
  };

  const deleteProperty = async (id: number) => {
    await api.delete(`/properties/${id}`);
    fetchProperties();
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Dashboard właściciela</h1>
      
      {/* Formularz */}
      <Card className="p-4 mb-6 shadow-md rounded-2xl">
        <h2 className="text-lg font-semibold mb-3">Dodaj mieszkanie</h2>
        <div className="flex gap-2">
          <Input 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="Nazwa mieszkania" 
          />
          <Input 
            value={address} 
            onChange={(e) => setAddress(e.target.value)} 
            placeholder="Adres" 
          />
          <Button 
            onClick={createProperty} 
            className="bg-[#FF6B6B] hover:bg-[#ff5252] text-white rounded-xl"
          >
            Dodaj
          </Button>
        </div>
      </Card>

      {/* Lista mieszkań */}
      <Card className="p-4 shadow-md rounded-2xl">
        <h2 className="text-lg font-semibold mb-3">Twoje mieszkania</h2>
        <ul className="space-y-2">
          {properties.map((p) => (
            <li 
              key={p.id} 
              className="flex justify-between items-center p-3 bg-white rounded-xl shadow-sm border"
            >
              <span className="text-gray-700">{p.name} – {p.address}</span>
              <div className="flex gap-2">
                <Button className="bg-gray-200 text-gray-700 rounded-xl px-3 py-1">Edytuj</Button>
                <Button 
                  onClick={() => deleteProperty(p.id)} 
                  className="bg-[#FF6B6B] text-white rounded-xl px-3 py-1"
                >
                  Usuń
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
