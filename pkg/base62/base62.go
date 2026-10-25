package base62

import (
	"errors"
	"strings"
)

const (
	alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	base     = uint64(len(alphabet))
)

func Encode(id uint64) string {
	if id == 0 {
		return string(alphabet[0])
	}

	var bytes []byte
	for id > 0 {
		remainder := id % base
		bytes = append(bytes, alphabet[remainder])
		id /= base
	}

	start := 0
	end := len(bytes) - 1
	for start < end {
		bytes[start], bytes[end] = bytes[end], bytes[start]
		start += 1
		end -= 1
	}

	return string(bytes)
}

func Decode(encoded string) (uint64, error) {
	var id uint64

	for _, char := range encoded {
		pos := strings.IndexRune(alphabet, char)
		if pos == -1 {
			return 0, errors.New("invalid base62 character")
		}

		id = id*base + uint64(pos)
	}

	return id, nil
}
