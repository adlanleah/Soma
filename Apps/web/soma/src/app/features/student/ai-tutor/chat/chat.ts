import { Component, signal, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LucideSend, LucideSparkles, LucideUser } from '@lucide/angular';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

@Component({
  selector: 'app-chat',
  imports: [FormsModule, LucideSend, LucideSparkles, LucideUser],
  templateUrl: './chat.html',
  styleUrl: './chat.css',
})
export class Chat implements AfterViewChecked {
  @ViewChild('messagesEnd') messagesEnd!: ElementRef;

  // State
  input = signal('');
  isTyping = signal(false);

  readonly suggestedQuestions = [
    'Can you explain fractions in a simple way?',
    'What is the water cycle?',
    'Help me understand photosynthesis',
    'What are the parts of speech?',
  ];

  messages = signal<Message[]>([
    {
      id: 1,
      role: 'assistant',
      content: "Hi there! I'm your AI learning buddy. I'm here to help you understand your lessons better. What would you like to learn about today? You can ask me anything about your subjects!",
      timestamp: new Date(),
    },
  ]);

  private readonly responses: Record<string, string> = {
    fractions: "Great question! Think of a fraction like a pizza. If you cut a pizza into 4 equal slices and eat 1 slice, you've eaten 1/4 (one-fourth) of the pizza! The top number (1) tells us how many pieces we have, and the bottom number (4) tells us how many equal pieces the whole thing was cut into. Would you like me to show you more examples?",
    'water cycle': "The water cycle is like nature's way of recycling water! Here's how it works:\n\n1. The sun heats up water in oceans, lakes, and rivers\n2. The water turns into vapor and rises up (evaporation)\n3. High up in the sky, it cools down and forms clouds (condensation)\n4. When clouds get heavy, water falls back as rain or snow (precipitation)\n5. Water flows back to oceans through rivers, and the cycle starts again!\n\nIsn't it cool how water keeps going around and around?",
    photosynthesis: "Photosynthesis is like a plant's way of making its own food! Plants are like little chefs that use:\n\n- Sunlight (energy)\n- Water (from roots)\n- Carbon dioxide (from air)\n\nThey mix these together in their leaves to make sugar (their food) and release oxygen for us to breathe! That's why we need plants - they give us the air we breathe while making their lunch!",
    speech: "Parts of speech are like different jobs that words do in a sentence! Here are the main ones:\n\n- Nouns: Names of things (dog, school, happiness)\n- Verbs: Action words (run, think, is)\n- Adjectives: Describe nouns (big, blue, happy)\n- Adverbs: Describe verbs (quickly, very, well)\n- Pronouns: Replace nouns (he, she, it, they)\n\nThink of a sentence like a team - each word has its special job to make the sentence work!",
  };

  get showSuggestions(): boolean {
    return this.messages().length === 1;
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  private scrollToBottom(): void {
    try {
      this.messagesEnd.nativeElement.scrollIntoView({ behavior: 'smooth' });
    } catch {}
  }

  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.handleSend();
    }
  }

  handleSend(message?: string): void {
    const text = message ?? this.input();
    if (!text.trim() || this.isTyping()) return;

    const userMessage: Message = {
      id: this.messages().length + 1,
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    this.messages.update(msgs => [...msgs, userMessage]);
    this.input.set('');
    this.isTyping.set(true);

    setTimeout(() => {
      const lower = text.toLowerCase();
      let responseText = "That's a great question! Let me think about how to explain this in a way that makes sense. Based on what you're asking, I'd suggest breaking it down into smaller parts. Could you tell me a bit more about what specifically you'd like to understand better? I'm here to help!";

      if (lower.includes('fraction')) responseText = this.responses['fractions'];
      else if (lower.includes('water cycle')) responseText = this.responses['water cycle'];
      else if (lower.includes('photosynthesis')) responseText = this.responses['photosynthesis'];
      else if (lower.includes('parts of speech') || lower.includes('speech')) responseText = this.responses['speech'];

      const aiMessage: Message = {
        id: this.messages().length + 2,
        role: 'assistant',
        content: responseText,
        timestamp: new Date(),
      };

      this.messages.update(msgs => [...msgs, aiMessage]);
      this.isTyping.set(false);
    }, 1500);
  }
}