package com.team6.backend.controller;

import com.team6.backend.model.Message;
import com.team6.backend.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = "http://localhost:5173")
public class MessageController {
    
    @Autowired
    private MessageService messageService;
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    
    /**
     * GET /api/messages/{matchId}
     * Get message history for a match
     */
    @GetMapping("/{matchId}")
    public ResponseEntity<List<Message>> getMessages(@PathVariable Long matchId) {
        List<Message> messages = messageService.getMessageHistory(matchId);
        return ResponseEntity.ok(messages);
    }
    
    /**
     * POST /api/messages/{matchId}
     * Send a message in a match
     */
    @PostMapping("/{matchId}")
    public ResponseEntity<Message> sendMessage(
            @PathVariable Long matchId,
            @RequestBody Map<String, String> body,
            @RequestHeader("X-User-ID") Long senderId) {
        
        String content = body.get("content");
        Message message = messageService.sendMessage(matchId, senderId, content);
        
        return ResponseEntity.ok(message);
    }
    
    /**
     * WebSocket endpoint for real-time messaging
     */
    @MessageMapping("/chat.send")
    public void sendMessageViaWebSocket(@Payload Map<String, Object> payload) {
        Long matchId = Long.valueOf(payload.get("matchId").toString());
        Long senderId = Long.valueOf(payload.get("senderId").toString());
        String content = payload.get("content").toString();
        
        Message message = messageService.sendMessage(matchId, senderId, content);
        
        // Broadcast to all subscribers of this match
        Map<String, Object> response = new HashMap<>();
        response.put("type", "MESSAGE");
        response.put("message", message);
        response.put("timestamp", LocalDateTime.now());
        
        messagingTemplate.convertAndSend("/topic/match/" + matchId, response);
    }
    
    /**
     * WebSocket endpoint for typing indicators
     */
    @MessageMapping("/chat.typing")
    public void typingIndicator(@Payload Map<String, Object> payload) {
        Long matchId = Long.valueOf(payload.get("matchId").toString());
        Long userId = Long.valueOf(payload.get("userId").toString());
        boolean isTyping = Boolean.parseBoolean(payload.get("isTyping").toString());
        
        Map<String, Object> typingNotification = new HashMap<>();
        typingNotification.put("type", "TYPING");
        typingNotification.put("userId", userId);
        typingNotification.put("isTyping", isTyping);
        typingNotification.put("timestamp", LocalDateTime.now());
        
        messagingTemplate.convertAndSend("/topic/match/" + matchId + "/typing", typingNotification);
    }
}