//
//  blank.swift
//  reactNativePushdyExample
//
//  Created by luatnd on 16/12/19.
//  Copyright © 2019 Facebook. All rights reserved.
//


/*
 We create this blank file to fix build issue:
 
 As this guide mentioned:
 https://facebook.github.io/react-native/docs/native-modules-ios#exporting-swift
 
 Important when making third party modules: Static libraries with Swift are only supported in Xcode 9 and later. In order for the Xcode project to build when you use Swift in the iOS static library you include in the module, your main app project must contain Swift code and a bridging header itself. If your app project does not contain any Swift code, a workaround can be a single empty .swift file and an empty bridging header.
 
 */

import Foundation
