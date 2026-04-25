# Cycle 20 DNS changeset

Authoritative DNS is **not Vercel DNS**. Current nameservers:

```txt
dns1.cdn.hr
dns2.cdn.hr
```

`vercel dns ls petpark.hr` shows no editable records under Vercel, so these records must be changed in the current DNS provider (cdn.hr / cyber_Folks) or by moving nameservers.

## Add / update records

### DMARC monitoring record

Replace current `_dmarc.petpark.hr` TXT (`v=DMARC1; p=none;`) with:

```txt
_dmarc.petpark.hr.  TXT  "v=DMARC1; p=none; rua=mailto:dmarc@petpark.hr; ruf=mailto:dmarc@petpark.hr; adkim=r; aspf=r;"
```

After 2 weeks of clean reports:

```txt
v=DMARC1; p=quarantine; pct=10; rua=mailto:dmarc@petpark.hr; ruf=mailto:dmarc@petpark.hr; adkim=r; aspf=r;
v=DMARC1; p=quarantine; pct=100; rua=mailto:dmarc@petpark.hr; ruf=mailto:dmarc@petpark.hr; adkim=r; aspf=r;
v=DMARC1; p=reject; rua=mailto:dmarc@petpark.hr; ruf=mailto:dmarc@petpark.hr; adkim=r; aspf=r;
```

### CAA records at apex

```txt
petpark.hr.  CAA  0 issue "letsencrypt.org"
petpark.hr.  CAA  0 issue "pki.goog"
petpark.hr.  CAA  0 issue "sectigo.com"
petpark.hr.  CAA  0 issue "globalsign.com"
```

### IPv6 / AAAA note

The original playbook asks for Vercel IPv6, but Vercel public docs currently say IPv6 is not supported. Do **not** invent an AAAA target for `petpark.hr` while the apex points to Vercel (`76.76.21.21`).

Cycle 20 IPv6 acceptance should be marked blocked/outdated unless hosting moves behind an IPv6-capable proxy/CDN.

## Verification commands

```bash
dig +short TXT _dmarc.petpark.hr
dig +short CAA petpark.hr
dig +short AAAA petpark.hr
curl -sI https://petpark.hr/ | grep -i '^content-security-policy:'
```
