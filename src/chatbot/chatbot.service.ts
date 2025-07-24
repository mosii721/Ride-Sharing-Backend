import { Injectable } from '@nestjs/common';
import { CreateChatbotDto } from './dto/create-chatbot.dto';

@Injectable()
export class ChatbotService {
  private readonly responses = [
    {
      question: 'what app is this',
      answer: 'This is the RideNow app, your fast and affordable ride-sharing solution.',
    },
    {
      question: 'how do i book a ride',
      answer: 'Tap "Book Ride", select your route, pickup, and destination — then confirm!',
    },
    {
      question: 'what is a route',
      answer: 'A route is a predefined path between two points that drivers frequently use.',
    },
    {
      question: 'why is it when i select a route the pickup and address input disappears',
      answer: 'That’s intentional. When using a preset route, fixed pickup and drop-off points are used.',
    },
    {
      question: ['why was my ride cancelled','my ride was cancelled'],
      answer: 'Rides can be cancelled if no driver accepts the request within the set time.',
    },
    {
      question: ['hello','hi','hey'],
      answer: 'Hi there! How can I assist you with your ride today?',
    },
    {
      question: 'bye',
      answer: 'Goodbye! Feel free to ask if you need anything else.',
    },
    {
      question: ['Why are there red markers on my map','what are the red markers','the red markers'],
      answer: 'The red markers indicate the available cars and if you tap on it you will see the car information.',
    },
  ];

  handleChat(chatMessageDto: CreateChatbotDto) {
    const cleanedMsg = chatMessageDto.message.trim().toLowerCase();

    const match = this.responses.find(q => {
    if (Array.isArray(q.question)) {
      return q.question.some(phrase => cleanedMsg.includes(phrase));
    } else {
      return cleanedMsg.includes(q.question);
    }
  });

    const reply = match
      ? match.answer
      : "Sorry, I couldn’t understand that. Try rephrasing your question.";

    return { reply };
  }
}
