const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

exports.chat = async (req, res) => {
  try {
    const { mensaje } = req.body;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: mensaje }]
    });

    res.json({ respuesta: completion.choices[0].message.content });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};