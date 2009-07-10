ActionController::Routing::Routes.draw do |map|
  map.resources :hidims
  map.about '/about/:action', :controller => 'about'

  map.root :controller => 'hidims', :action => 'index'
end
