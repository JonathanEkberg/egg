package main

import (
	"log"
	"encoding/json"
	"github.com/wagslane/go-rabbitmq"
	"github.com/go-gomail/gomail"
	"crypto/tls"
)


const (
	EmailRoute = "email_route"
	EmailExchange = "email"
	EmailQueue = "email_queue"
)





type JsonEmailData struct {
	To string `json:"to"`
	Body string `json:"body"`
}

type JsonEmail struct {
	Type string `json:"type"`
	Version int `json:"version"`
	Data JsonEmailData `json:"data"`
}





func consumer(conn *rabbitmq.Conn, d *gomail.Dialer) {
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
		err = consumer.Run(func(delivery rabbitmq.Delivery) rabbitmq.Action {

			var jemail JsonEmail
			err := json.Unmarshal(delivery.Body, &jemail)
			if err != nil {
				log.Printf("Failed to parse json\n")
			}

			if jemail.Version == 1 {
			} else {
				log.Printf("Version %d not supported", jemail.Version)
			}
			
			err = sendVerifyEmail(d, jemail.Data.To, jemail.Data.Body);
			if err != nil {
				log.Printf("Failed to send email");
				return rabbitmq.NackRequeue
			}

			log.Printf("consumed: %v", string(delivery.Body))
			// rabbitmq.Ack, rabbitmq.NackDiscard, rabbitmq.NackRequeue
			return rabbitmq.Ack
		})

		if err != nil {
			log.Fatal(err)
		}
	}
}


func sendVerifyEmail(d *gomail.Dialer, to_address string, body string) error {
	m := gomail.NewMessage()

	m.SetHeader("From", "noreply@gey.com")
	m.SetHeader("To", to_address)
	m.SetHeader("Subject", "Verify your account")

	m.SetBody("text/html", body)

	err := d.DialAndSend(m)	
	return err
}


func createRabbitmqconn(rabbitmqHost string) *rabbitmq.Conn {
	conn, err := rabbitmq.NewConn(
		rabbitmqHost,
		rabbitmq.WithConnectionOptionsLogging,
	)
	if err != nil {
		return err
	}
}

func main() {

	const (
		rabbitmqHost = "amqp://guest:guest@localhost"
		smtpHost = "localhost"
		smtpPort = 1025
		smtpUser = "user"
		smtpPass = "123456"
	)


	// publisher()


	conn, err := createRabbitmqconn(rabbitmqHost)
	if err != nil {
		log.Fatal(err)
	}
	defer conn.Close()
	
	d := gomail.NewDialer(smtpHost, smtpPort, smtpUser, smtpPass)
	d.TLSConfig = &tls.Config{InsecureSkipVerify: true}
	
	
	consumer(conn, d)
	
	// err := sendVerifyEmail(d, "test@gmail.com", "test", "https://www.getavirus.com")
	// if err != nil {
	// 	log.Fatalf("err = %v\n", err)
	// }


}
