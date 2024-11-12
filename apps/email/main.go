package main

import (
	"log"
	"encoding/json"
	"github.com/wagslane/go-rabbitmq"
	"github.com/go-gomail/gomail"
)


const (
	EmailRoute = "email_route"
	EmailExchange = "email"
	EmailQueue = "email_queue"
)


func publisher() {
	conn, err := rabbitmq.NewConn(
		"amqp://guest:guest@localhost",
		rabbitmq.WithConnectionOptionsLogging,
	)
	if err != nil {
		log.Fatal(err)
	}
	defer conn.Close()
	
	publisher, err := rabbitmq.NewPublisher(
		conn,
		rabbitmq.WithPublisherOptionsLogging,
		rabbitmq.WithPublisherOptionsExchangeName(EmailExchange),
		rabbitmq.WithPublisherOptionsExchangeDeclare,
	)
	if err != nil {
		log.Fatal(err)
	}
	defer publisher.Close()
	

	RawJsonCorrput :=`
	{
		"type": "email",
		"version": 1,
		"data": { "to": "", "body": "" }
	}
	`

	err = publisher.Publish(
		[]byte(RawJsonCorrput),
		[]string{EmailRoute},
		rabbitmq.WithPublishOptionsContentType("application/json"),
		rabbitmq.WithPublishOptionsExchange(EmailExchange),
	)

	if err != nil {
		log.Println(err)
	}
}


type JsonEmailData struct {
	To string `json:"to"`
	Body string `json:"body"`
}

type JsonEmail struct {
	Type string `json:"type"`
	Version int `json:"version"`
	Data JsonEmailData `json:"data"`
}


func initQueue() {

}


func consumer() {
	conn, err := rabbitmq.NewConn(
		"amqp://guest:guest@localhost",
		rabbitmq.WithConnectionOptionsLogging,
	)
	if err != nil {
		log.Fatal(err)
	}
	defer conn.Close()
	
	consumer, err := rabbitmq.NewConsumer(
		conn,
		EmailQueue,
		rabbitmq.WithConsumerOptionsRoutingKey(EmailRoute),
		rabbitmq.WithConsumerOptionsExchangeName(EmailExchange),
		rabbitmq.WithConsumerOptionsExchangeDeclare,
	)
	if err != nil {
		log.Fatal(err)
	}
	defer consumer.Close()
		
	for {
		err = consumer.Run(func(d rabbitmq.Delivery) rabbitmq.Action {

			var jemail JsonEmail
			err := json.Unmarshal(d.Body, &jemail)
			if err != nil {
				log.Printf("Failed to parse json\n")
			}

			if jemail.version == 1 {

			} else {
				log.Printf("Version in not supported")
			}


			log.Printf("consumed: %v", string(d.Body))
			// rabbitmq.Ack, rabbitmq.NackDiscard, rabbitmq.NackRequeue
			return rabbitmq.Ack
		})

		if err != nil {
			log.Fatal(err)
		}
	}
}



func sendEmail(to, subject, body string) error {
	from := "EMAIL"
	password := "PASSWORD"

	// SMTP server configuration.
	smtpHost := "smtp.gmail.com"
	smtpPort := "587"

	// Message.
	msg := "From: " + from + "\n" +
		"To: " + to + "\n" +
		"Subject: " + subject + "\n\n" +
		body

	// Authentication.
	auth := smtp.PlainAuth("", from, password, smtpHost)

	// Sending email.
	err := smtp.SendMail(smtpHost+":"+smtpPort, auth, from, []string{to}, []byte(msg))
	if err != nil {
		return err
	}
	return nil
}



func main() {
	// publisher()
	
	consumer()
}
