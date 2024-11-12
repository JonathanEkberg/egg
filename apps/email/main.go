package main

import (
	"log"
	"encoding/json"
	"github.com/wagslane/go-rabbitmq"
	"github.com/go-gomail/gomail"
	"crypto/tls"
	"fmt"
)


const (
	EmailRoute = "email_route"
	EmailExchange = "email"
	EmailQueue = "email_queue"
)


func publisher(conn *rabbitmq.Conn) {
	
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
		err = consumer.Run(func(d rabbitmq.Delivery) rabbitmq.Action {

			var jemail JsonEmail
			err := json.Unmarshal(d.Body, &jemail)
			if err != nil {
				log.Printf("Failed to parse json\n")
			}

			if jemail.Version == 1 {
			} else {
				log.Printf("Version %d not supported", jemail.Version)
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


func sendVerifyEmail(d *gomail.Dialer, to_address string, to_name string, link string) error {
	m := gomail.NewMessage()

	m.SetHeader("From", "noreply@gey.com")
	m.SetHeader("To", to_address)
	m.SetHeader("Subject", "Verify your account")

	bodyTemplate := 
`<h1>Hey, %s</h1>
Heres the link to verify <a href="%s">verify</a>`

	body := fmt.Sprintf(bodyTemplate, to_name, link)

	m.SetBody("text/html", body)

	err := d.DialAndSend(m)	
	return err
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
