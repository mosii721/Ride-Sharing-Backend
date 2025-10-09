import { Injectable } from '@nestjs/common';
import { CreateChatbotDto } from './dto/create-chatbot.dto';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ChatbotService {
  private genAI: GoogleGenerativeAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');

    if (!apiKey) {
      throw new Error('Missing GEMINI_API_KEY in environment variables.');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async handleChat(chatMessageDto: CreateChatbotDto) {
    const systemPrompt = `
You are a chatbot assistant for the RideNow ride-sharing app. Only answer questions that are relevant to the app.
If the user asks something unrelated (e.g. world events, history, science), politely say:
"I'm only able to answer questions about this ride-sharing platform."

Here's how the app works:

- Book a ride: Go to the sidebar and click request a ride > or click on you dashboard "Quick Book" > Fill the form with pickup and destination > The red markers on the map indicate available cars and from there they can book from a car that is near her location (available drivers) and by the way the map already shows the red markers even without someone having to book a ride the map is always there showing th avilable drivers so you can check before you book.
- Routes: You can select a route if the departure time hasn't passed and there are available seats.
- Payments: Rides can be paid via M-Pesa or card at the end of the trip.
- Admin dashboard: Admins can view total drivers, current ride activity, users, and recent payments.
- Real-time driver data is available in the system backend but NOT to the AI directly.

 **Understanding Routes**
- A "Route" is a predefined path (e.g. Home to Work).
- Choosing a route helps you skip filling in pickup/drop-off.
- It supports **Carpooling**, which is cheaper, but has limited seats and specific departure times.
- If you choose a route, you’ll only need to select your ride type and confirm — it's quicker and ideal for daily trips.
- If no route is selected, you can still enter your pickup and destination manually (Private Ride or Delivery), but it may cost more.
- To Check for available routes go to your sidebar click on available routes to see the routes which are currently available

🔹 **Ride Types**
- Private Ride: You get the vehicle to yourself.
- Carpool: You share with others, cheaper, but only works with routes.
- Delivery: Send packages.

🔹 **Payments**
- Pay by M-Pesa or stripe located on your bookings page when a ride is completed or in progress

-for a driver to update anything about their driver profile or vehicle information they have to contact support


Answer only based on that app logic. Keep answers helpful and on-topic.
`;

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const result = await model.generateContent([
         { text: `${systemPrompt}\n\nUser: ${chatMessageDto.message}` }
      ]);

      const reply = result.response.text();
      return { reply };
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw new Error('Failed to process chatbot response.');
    }
  }
}
