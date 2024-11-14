package main

import (
	"testing"
	"github.com/go-gomail/gomail"
	"crypto/tls"
	"net/http"
	"encoding/json"
	"io"
)



func TestSendMail(t *testing.T) {

	textSent := "nyaste"
	to_address := "joemamannnnn@joemama.com" 

	expected_from := "noreply@gey.com"
	expected_subject := "Verify your account"

	d := gomail.NewDialer(smtpHost, smtpPort, smtpUser, smtpPass)
	d.TLSConfig = &tls.Config{InsecureSkipVerify: true}
	
	err := sendVerifyEmail(d, to_address, textSent)
	if err != nil {
		t.Errorf("Failed to send because %v\n", err)
	}
	resp, err := http.Get("http://localhost:1080/api/emails")
	if err != nil {
		t.Fatalf("Failed to get response because %v\n", err)
	}
	if resp.StatusCode != 200 {
		t.Fatalf("expected %v got %v\n", 200, resp.StatusCode)
	}

	defer resp.Body.Close()
	body, err := io.ReadAll(resp.Body)

	var jsonData []map[string]interface{}
	err = json.Unmarshal(body, &jsonData)
	if err != nil {
		t.Fatalf("%v\n", err)
	}
	first := jsonData[0]

	subject := first["subject"]
	text := first["text"]


	var to string
	{
		to_ := first["to"].(map[string]interface{})
		value := to_["value"].([]interface{})
		value0 := value[0].(map[string]interface{})
		address := value0["address"]

		to = address.(string)
	}

	var from string
	{
		from_ := first["from"].(map[string]interface{})
		value := from_["value"].([]interface{})
		value0 := value[0].(map[string]interface{})
		address := value0["address"]

		from = address.(string)
	}


	if from != expected_from {
		t.Errorf("Expected %s got %s\n", expected_from, from)
	}

	if to != to_address {
		t.Errorf("Expected %s got %s\n", to_address, to)
	}

	if text != textSent {
		t.Errorf("Expected %s got %s\n", textSent, text)
	}

	if subject != expected_subject {
		t.Errorf("Expected %s got %s\n", expected_subject, subject)
	}

}