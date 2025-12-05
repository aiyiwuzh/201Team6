package com.team6.backend.service;

import com.team6.backend.model.Message;
import com.team6.backend.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class MessageService {
    
    private final MessageRepository messageRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final SwipeService swipeService;
    
    @Autowired
    public MessageService(MessageRepository messageRepository,
                         SimpMessagingTemplate messagingTemplate,
                         SwipeService swipeService) {
        this.messageRepository = messageRepository;
        this.messagingTemplate = messagingTemplate;
        this.swipeService = swipeService;
    }
    
    /**
     * Send a message between matched users
     */
    @Transactional
    public Message sendMessage(Long matchId, Long senderId, String content) {
        // TODO: Validate that sender is part of the match
        // TODO: Validate that match exists and is active
        
        // Create and save message
        Message message = new Message(matchId, senderId, content);
        Message savedMessage = messageRepository.save(message);
        
        // Send via WebSocket
        sendMessageViaWebSocket(savedMessage);
        
        return savedMessage;
    }
    
    /**
     * Send message via WebSocket to both users in the match
     */
    private void sendMessageViaWebSocket(Message message) {
        // Send to the match's topic
        messagingTemplate.convertAndSend("/topic/match/" + message.getMatchId(), message);
    }
    
    /**
     * Get message history for a match
     */
    public List<Message> getMessageHistory(Long matchId) {
        return messageRepository.findMessagesByMatchId(matchId);
    }
    
    /**
     * Mark message as read
     */
    @Transactional
    public void markAsRead(Long messageId) {
        messageRepository.findById(messageId).ifPresent(message -> {
            message.setIsRead(true);
            messageRepository.save(message);
        });
    }
}