---
title: SCOM Entra Prevent New SMS and Call MFA Methods
date: 2025-04-28
author: Lone Star Coder
summary: A simple way to remove new SMS and Call MFA Methods while keeping existing SMS and Call MFA methods.
tags: Entra, Azure, MFA, SMS, Call, O365, Security, Authentication
---

# Entra Prevent New SMS and Call MFA Methods
1. Move your tenant to the ** Authentication methods policy** (Entra ID  > Authentication methods > Policies). ([Manage authentication methods - Microsoft Entra ID | Microsoft Learn](https://learn.microsoft.com/en-us/entra/identity/authentication/concept-authentication-methods-manage))  

2. Create a *static* security group – e.g. **Legacy-Phone-MFA** – and put every user who already has an SMS or Voice-Call method in it (script below). Leave new hires out.  

3. In the same blade open **SMS** and **Voice call**:  
&nbsp;&nbsp;• *Enable = On*  
&nbsp;&nbsp;• *Target = Selected users and groups* ➜ **Legacy-Phone-MFA**  
&nbsp;&nbsp;• Tick the check-boxes you still need: “Use for MFA” (and/or SSPR). Do **not** tick “Use for sign-in” unless you purposely allow first-factor SMS. ([SMS-based user sign-in for Microsoft Entra ID](https://learn.microsoft.com/en-us/entra/identity/authentication/howto-authentication-sms-signin?utm_source=chatgpt.com))  

4. Save both methods.  

5. In **Legacy MFA settings** and **SSPR settings** un-tick **Call to phone** and **Text message to phone** so nobody outside the group can register via the old policies. ([Manage authentication methods - Microsoft Entra ID | Microsoft Learn](https://learn.microsoft.com/en-us/entra/identity/authentication/concept-authentication-methods-manage))  

That’s it: existing users keep working; nobody new can add SMS or voice.

---

### One-time PowerShell to populate the group

```powershell
# Modules: Install-Module Microsoft.Graph -Scope CurrentUser
Connect-MgGraph -Scopes "UserAuthenticationMethod.Read.All","Group.ReadWrite.All"

$group = New-MgGroup `
        -DisplayName "Legacy-Phone-MFA" -SecurityEnabled:$true `
        -MailEnabled:$false -MailNickname "legacyphonemfa"

Get-MgUser -All | ForEach-Object {
    $phone = Get-MgUserAuthenticationPhoneMethod -UserId $_.Id -ErrorAction SilentlyContinue
    if ($phone) { New-MgGroupMember -GroupId $group.Id -DirectoryObjectId $_.Id }
}
```
Run it once; afterwards you just maintain membership manually (or with another scheduled script).

---

### Why this works

* A method is usable if **any** policy permits it; scoping it only to the legacy group means outsiders can’t register it. ([Manage authentication methods - Microsoft Entra ID | Microsoft Learn](https://learn.microsoft.com/en-us/entra/identity/authentication/concept-authentication-methods-manage))  
* Disabling the method in the old MFA/SSPR blades prevents those policies from reopening registration paths.  
* Microsoft’s own guidance recommends moving away from phone transports but allows this phased-out approach. ([Stop Using Phone-Based Responses for Multifactor Authentication](https://practical365.com/stop-using-phone-based-mfa/?utm_source=chatgpt.com))  

No Conditional-Access trickery needed – the Authentication methods policy handles the grandfathering cleanly.
