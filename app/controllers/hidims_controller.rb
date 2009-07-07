class HidimsController < ApplicationController
  def new
    @hidim = Hidim.new
  end
  
  def create
    if params[:hidim].nil? or params[:hidim][:torrent].nil? or 
         params[:hidim][:torrent].content_type.nil? or 
         params[:hidim][:torrent].content_type != "application/x-bittorrent"
      flash[:notice] = "Sorry, the file you uploaded does not appear to be a torrent"
      redirect_to "/"
    else
      @hidim = Hidim.create( params[:hidim] )
      redirect_to @hidim
    end
  end

  def show
    @hidim = Hidim.find params[:id]
  end

  def index
    @hidim = Hidim.new

    @hidims = Hidim.featured.find(:all, :limit => 10, :order => "created_at DESC")
  end
end
