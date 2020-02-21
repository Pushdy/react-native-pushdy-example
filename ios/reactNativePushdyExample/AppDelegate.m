/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

#import "AppDelegate.h"

#import <React/RCTBridge.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>

//#import <PushdySDK/PushdySDK-Swift.h> // Included in .h
#import <react_native_pushdy/react_native_pushdy-Swift.h>


@implementation AppDelegate


- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  RCTBridge *bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:launchOptions];
  RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:bridge
                                                   moduleName:@"reactNativePushdyExample"
                                            initialProperties:nil];

  rootView.backgroundColor = [[UIColor alloc] initWithRed:1.0f green:1.0f blue:1.0f alpha:1];

  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = rootView;
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];
  
  // Add Pushdy module
  NSString *clientKey = @"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1OTQ0NTMyNTU5NiIsImFwcF9pZCI6InJlYWN0X25hdGl2ZV9wdXNoZHlfZXhhbXBsZSIsImlhdCI6MTU3NTU0MDM0NX0.Dt81jYANo4QzV_q8JhZxfSTzq44SivUa-yCwPteyCiE";
  // [Pushdy initWithClientKey:clientKey delegate:self launchOptions:launchOptions];
  // NSInteger a = 6789;
  // [RNPushdy sayHello:clientKey numberArgument:a];
  [RNPushdy registerSdk:clientKey delegate:self launchOptions:launchOptions];
  
  return YES;
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:nil];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}


@end
