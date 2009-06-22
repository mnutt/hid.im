ActionController::Routing::Routes.draw do |map|
  map.resources :piings

  map.root :controller => 'piings', :action => 'index'
end
