package main

import (
	"log"
	"encoding/json"
	"github.com/wagslane/go-rabbitmq"
	"github.com/go-gomail/gomail"
	"crypto/tls"
	"os"
	"strconv"
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
				log.Printf("Failed to send email because of %v", err);
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

func main() {

	rabbitmqHost := os.Getenv("RABBIT_MQ_HOST")
	smtpHost := os.Getenv("SMTP_HOST")
	var smtpPort int
	{
		smtpPort_env := os.Getenv("SMTP_PORT")
		var err error
		smtpPort, err = strconv.Atoi(smtpPort_env)
		if err != nil {
			log.Fatalf("Expected port to be int but got '%s'", smtpPort_env)
		}
	}
	smtpUser := os.Getenv("SMTP_USER")
	smtpPass := os.Getenv("SMTP_PASS")

	conn, err := rabbitmq.NewConn(
		rabbitmqHost,
		rabbitmq.WithConnectionOptionsLogging,
	)
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
