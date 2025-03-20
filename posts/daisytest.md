---
title: Daisy Test
date: 2025-03-19
author: Lone Star Coder
summary: A straightforward guide to removing daisy-chained gateway servers in System Center Operations Manager (SCOM)
tags: SCOM, Gateway, Server Management, System Center
---

# SCOM Daisy-chained Gateway Server Removal

## Configuration Overview

Main Management Server Ms01 --> Gateway01 --> Gateway02

### Gateway02 is the Daisy chained gateway
If you want to remove it, you have to treat gateway01 as its management server.
**HOWEVER**, you still RUN the command on the MAIN Management Server, ms01.

## Instructions
On the SCOM Management Server (ms01):

1. Go to this path - `C:\Software\System Center Operations Manager 2019\SupportTools\AMD64` (or wherever SCOM is installed, and the support tools folder)
2. Copy the file (`Microsoft.EnterpriseManagement.GatewayApprovalTool.exe`) to here: `C:\Program Files\Microsoft System Center\Operations Manager\Server` (or wherever SCOM is installed)

### Removal Command (In PowerShell Elevated Prompt)
Run the following command:

```powershell
.\Microsoft.EnterpriseManagement.GatewayApprovalTool.exe /ManagementServerName=gateway01.domain2.com /GatewayName=gatewayw02.domain3.com /Action=Delete
```

#### Expected Output
You should see output similar to this:

```powershell
PS C:\Program Files\Microsoft System Center\Operations Manager\Server> .\Microsoft.EnterpriseManagement.GatewayApprovalTool.exe /ManagementServerName=gateway01.domain2.com /GatewayName=gatewayw02.domain3.com /Action=Delete
# Microsoft.EnterpriseManagement.GatewayApprovalTool
# Copyright (c) Microsoft Corporation. All rights reserved.
# The removal of server gatewayw02.domain3.com from the management group completed successfully.  If you have not already uninstalled the Gateway Server from gatewayw02.domain3.com, it may become a managed agent depending on your Auto Approval configuration.
# If this is the case, you will need to uninstall it from the Agent Management view.
PS C:\Program Files\Microsoft System Center\Operations Manager\Server>
```

## References
- [Blake Drumm's Guide: How to Decommission SCOM Gateway](https://blakedrumm.com/blog/how-to-decommission-scom-gateway/)
- [Microsoft Docs: Remove a Gateway Server](https://learn.microsoft.com/en-us/system-center/scom/remove-gateway-server?view=sc-om-2025)

## Important Notes
After removing the gateway server, you may need to check the Agent Management view if the server appears as a managed agent due to Auto Approval settings. If this happens, you'll need to uninstall it from there as well.