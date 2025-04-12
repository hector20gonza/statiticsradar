export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Método no permitido" });
  }

  const { email } = req.body;


  if (!email || !email.includes("@")) {
    return res.status(400).json({ message: "Correo no válido" });
  }

  try {
    const brevoApiKey = process.env.BREVO_API_KEY;
    const brevoListId = parseInt(process.env.BREVO_LIST_ID, 10);
    console.log('API Key:', process.env.BREVO_API_KEY);
console.log('List ID:', process.env.BREVO_LIST_ID);

    const response = await fetch("https://api.brevo.com/v3/contacts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": brevoApiKey
      },
      body: JSON.stringify({
        email: email,
        listIds: [brevoListId],
        updateEnabled: true
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ message: data.message || "Error en la API de Brevo" });
    }

    return res.status(200).json({ message: "Suscripción exitosa", data });
  } catch (error) {
    console.error("Error en suscripción:", error);
    return res.status(500).json({ message: "Error interno del servidor ok" });
  }
}
